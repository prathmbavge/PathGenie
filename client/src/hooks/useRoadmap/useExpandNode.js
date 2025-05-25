// // src/hooks/useRoadmap/useExpandNode.js
// import { useRef, useCallback } from "react";
// import { requestHandler } from "../../../utils/index";
// import { showErrorToast, showSuccessToast } from "../../../utils/toastUtils";
// import { expandNode, getNodeResources } from "../../api/mindmapApi";
// import { getLayoutedElements } from "../../../utils/layout";

// /**
//  * Hook: useExpandNode
//  * - mindmapId: string
//  * - nodesRef, edgesRef: refs containing current arrays (always up-to-date)
//  * - setNodes, setEdges, setLoading: state setters
//  * - openDrawer: function to show resources when a leaf is clicked
//  * - updateNodeHandler, toggleCollapse: callbacks for updating/collapsing nodes
//  */
// export const useExpandNode = (
//   mindmapId,
//   nodesRef,
//   edgesRef,
//   setNodes,
//   setEdges,
//   setLoading,
//   openDrawer,
//   updateNodeHandler,
//   toggleCollapse
// ) => {
//   const abortControllerRef = useRef(null);

//   const expandNodeHandler = useCallback(
//     async (nodeId) => {
//       if (!mindmapId) return;

//       // Abort any ongoing expansion
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       abortControllerRef.current = new AbortController();

//       await requestHandler(
//         () =>
//           expandNode(mindmapId, nodeId, abortControllerRef.current.signal),
//         setLoading,
//         async (res) => {
//           // Create React Flow nodes from server response
//           console.log("Expanded node data:", res.data.newNodes);
//           const fetchedNodes = res.data.newNodes.map((node) => ({
//             id: node._id.toString(),
//             type: "custom",
//             data: {
//               id: node._id.toString(),
//               status: node.status,
//               shortDesc: node.data.shortDesc,
//               label: node.data.label,
//               // Only leaf nodes get an onExpand handler; non-leaf get onCollapse
//               onExpand: node.isLeafNode ? expandNodeHandler : undefined,
//               onUpdate: updateNodeHandler,
//               onCollapse: node.isLeafNode ? undefined : toggleCollapse,
//               openDrawer: async () => {
//                 const { data } = await getNodeResources(
//                   mindmapId,
//                   node._id,
//                   abortControllerRef.current.signal
//                 );
//                 openDrawer(data.resources || {});
//               },
//             },
//             parent: node.parent ? node.parent.toString() : null,
//             position: { x: 0, y: 0 },
//             ancestors: node.ancestors || [],
//           }));

//           // Merge with existing nodes
//           const mergedNodes = [...nodesRef.current, ...fetchedNodes];

//           // CORRECTED: flatten the new edges before merging
//           //      WRONG:  const edges = [res.data.edges, ...edgesRef.current];
//           //      RIGHT: spread the new‐edges array
//           const edges = [...res.data.edges, ...edgesRef.current];

//           // Re-run layout on the entire graph
//           const { nodes: layoutedNodes, edges: layoutedEdges } =
//             getLayoutedElements(mergedNodes, edges, { direction: "LR" } );

//           setNodes(layoutedNodes);
//           setEdges(layoutedEdges);
//           showSuccessToast("Node expanded successfully");
//         },
//         (error) => {
//           if (error.name !== "AbortError") {
//             console.error("Error expanding node:", error);
//             showErrorToast("Failed to expand node.");
//           }
//         }
//       );
//     },
//     [
//       mindmapId,
//       setLoading,
//       setNodes,
//       setEdges,
//       openDrawer,
//       nodesRef,
//       edgesRef,
//       updateNodeHandler,
//       toggleCollapse, // ADDED so React re-creates this callback if toggleCollapse ever changes
//     ]
//   );

//   return expandNodeHandler;
// };





import { useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { showErrorToast, showSuccessToast } from "../../../utils/toastUtils";
import { expandNode, getNodeResources } from "../../api/mindmapApi";
import { getLayoutedElements } from "../../../utils/layout";

export const useExpandNode = (
  mindmapId,
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  setLoading,
  openDrawer,
  updateNodeHandler,
  toggleCollapse
) => {
  const abortControllerRef = useRef(null);

  const expandNodeHandler = useCallback(
    async (nodeId) => {
      if (!mindmapId) return;

      // Abort any ongoing expansion
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      await requestHandler(
        () =>
          expandNode(mindmapId, nodeId, abortControllerRef.current.signal),
        setLoading,
        async (res) => {
          const expandedNodeId = nodeId;
          const wrapperId = `wrapper-${expandedNodeId}`;

          // Create the wrapper node for the expanded node's children
          const wrapperNode = {
            id: wrapperId,
            type: "group",
            data: { label: "" },
            position: { x: 0, y: 0 },
            style: { width: 0, height: 0, background: "transparent", border: "1px solid #ddd" },
          };

          // Map new nodes with parentId set to the wrapper node
          const newReactNodes = res.data.newNodes.map((node) => ({
            id: node._id.toString(),
            type: "custom",
            data: {
              id: node._id.toString(),
              status: node.status,
              shortDesc: node.data.shortDesc,
              label: node.data.label,
              onExpand: node.isLeafNode ? expandNodeHandler : undefined,
              onUpdate: updateNodeHandler,
              onCollapse: node.isLeafNode ? undefined : toggleCollapse,
              openDrawer: async () => {
                try {
                  const { data } = await getNodeResources(
                    mindmapId,
                    node._id,
                    abortControllerRef.current.signal
                  );
                  openDrawer(data.resources || {});
                } catch (error) {
                  if (error.name !== "AbortError") {
                    showErrorToast("Failed to fetch node resources.");
                  }
                }
              },
            },
            position: { x: 0, y: 0 },
            parentId: wrapperId,
            extent: "parent",
            ancestors: node.ancestors || [],
          }));

          // Update the expanded node to reflect its new non-leaf status
          const updatedNodes = nodesRef.current.map((node) => {
            if (node.id === expandedNodeId) {
              const hasParent = !!node.parentId;
              return {
                ...node,
                data: {
                  ...node.data,
                  onExpand: undefined,
                  onCollapse: toggleCollapse,
                },
                parentId: hasParent ? node.parentId : wrapperId,
              };
            }
            return node;
          });

          // Merge all nodes: existing (updated) + wrapper + new nodes
          const mergedNodes = [...updatedNodes, wrapperNode, ...newReactNodes];

          // Merge edges
          const mergedEdges = [...res.data.edges, ...edgesRef.current];

          // Validate edges to ensure they reference existing nodes
          const allNodeIds = new Set(mergedNodes.map((node) => node.id));
          const validEdges = mergedEdges.filter((edge) => {
            if (!edge.source || !edge.target) {
              console.warn(`Invalid edge: ${edge.id} has null source or target`);
              return false;
            }
            if (!allNodeIds.has(edge.source) || !allNodeIds.has(edge.target)) {
              console.warn(`Edge ${edge.id} references non-existent node(s): source=${edge.source}, target=${edge.target}`);
              return false;
            }
            return true;
          });

          // Re-run layout on the entire graph
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            mergedNodes,
            validEdges,
            { direction: "LR" }
          );

          // Update state
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          showSuccessToast("Node expanded successfully");
        },
        (error) => {
          if (error.name !== "AbortError") {
            console.error("Error expanding node:", error);
            showErrorToast("Failed to expand node.");
          }
        }
      );
    },
    [
      mindmapId,
      setLoading,
      setNodes,
      setEdges,
      openDrawer,
      nodesRef,
      edgesRef,
      updateNodeHandler,
      toggleCollapse,
    ]
  );

  return expandNodeHandler;
};