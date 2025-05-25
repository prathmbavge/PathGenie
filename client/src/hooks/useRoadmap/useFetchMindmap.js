// // src/hooks/useRoadmap/useFetchMindmap.js
// import { useEffect, useRef, useCallback } from "react";
// import { requestHandler } from "../../../utils/index";
// import { showErrorToast } from "../../../utils/toastUtils";
// import { getMindmap, getNodeResources } from "../../api/mindmapApi";
// import { getLayoutedElements } from "../../../utils/layout";

// /**
//  * Hook: useFetchMindmap
//  * - mindmapId: string | null
//  * - setNodes, setEdges, setLoading: state setters from the parent hook.
//  * - openDrawer: function to call when user clicks "Resources".
//  * - expandNodeHandler, updateNodeHandler, toggleCollapse: node callbacks
//  */
// export const useFetchMindmap = (
//   mindmapId,
//   setNodes,
//   setEdges,
//   setLoading,
//   openDrawer,
//   expandNodeHandler,
//   updateNodeHandler,
//   toggleCollapse
// ) => {
//   const abortControllerRef = useRef(null);

//   const fetchMindmap = useCallback(
//     async () => {
//       if (!mindmapId) {
//         showErrorToast("No mindmap ID provided.");
//         return;
//       }

//       // Abort any previous fetch
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       abortControllerRef.current = new AbortController();

//       await requestHandler(
//         () => getMindmap(mindmapId, abortControllerRef.current.signal),
//         setLoading,
//         async (res) => {
//           // Transform server nodes into React Flow format
//           const reactNodes = res.data.nodes.map((node) => ({
//             id: node._id.toString(),
//             type: "custom",
//             data: {
//               id: node._id.toString(),
//               status: node.status,
//               shortDesc: node.data.shortDesc,
//               label: node.data.label,
//               onExpand: node.isLeafNode ? expandNodeHandler : undefined,
//               onUpdate: updateNodeHandler,
//               onCollapse: node.isLeafNode ? undefined : toggleCollapse,
//               onDelete: async () => {
//                 // Placeholder for node deletion if needed
//               },
//               openDrawer: async () => {
//                 const { data } = await getNodeResources(
//                   mindmapId,
//                   node._id,
//                   abortControllerRef.current.signal
//                 );
//                 console.log("Fetched node resources:", data.resources);
//                 openDrawer(data.resources || {});
//               },
//             },
//             parent: node.parent ? node.parent.toString() : null,
//             position: { x: 0, y: 0 },
//             ancestors: node.ancestors || [],
//           }));

//           // Generate edges from server
//           const initialEdges = res.data.edges;

//           // Initial layout (horizontal)
//           const { nodes: layoutedNodes, edges: layoutedEdges } =
//             getLayoutedElements(reactNodes, initialEdges, { direction: "LR" });

//           setNodes(layoutedNodes);
//           setEdges(layoutedEdges);
//         },
//         (error) => {
//           if (error.name !== "AbortError") {
//             console.error("Error fetching mindmap:", error);
//             showErrorToast("Failed to fetch mindmap data.");
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
//       expandNodeHandler,
//       updateNodeHandler,
//       toggleCollapse, // ADDED so React re-creates this callback if toggleCollapse ever changes
//     ]
//   );

//   useEffect(() => {
//     fetchMindmap();
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [fetchMindmap]);
// };

import { useEffect, useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { showErrorToast } from "../../../utils/toastUtils";
import { getMindmap, getNodeResources } from "../../api/mindmapApi";
import { getLayoutedElements } from "../../../utils/layout";

/**
 * Hook: useFetchMindmap
 * - mindmapId: string | null
 * - setNodes, setEdges, setLoading: state setters from the parent hook.
 * - openDrawer: function to call when user clicks "Resources".
 * - expandNodeHandler, updateNodeHandler, toggleCollapse: node callbacks
 */
export const useFetchMindmap = (
  mindmapId,
  setNodes,
  setEdges,
  setLoading,
  openDrawer,
  expandNodeHandler,
  updateNodeHandler,
  toggleCollapse,
  downloadResourcesHandler
) => {
  const abortControllerRef = useRef(null);

  const fetchMindmap = useCallback(
    async () => {
      if (!mindmapId) {
        showErrorToast("No mindmap ID provided.");
        return;
      }

      // Abort any previous fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      await requestHandler(
        () => getMindmap(mindmapId, abortControllerRef.current.signal),
        setLoading,
        async (res) => {
          const nodes = res.data.nodes;
          const edges = res.data.edges;
          // console.log("Fetched mindmap nodes:", nodes);
          // console.log("Fetched mindmap edges:", edges);

          // Single-pass parent mapping and node ID set
          const parentMap = new Map();
          const nodeIds = new Set();
          nodes.forEach(node => {
            nodeIds.add(node._id.toString());
            if (node.parent) {
              parentMap.set(node.parent.toString(), true);
            }
          });

          // Pre-allocate array for performance
          const reactNodes = new Array(nodes.length + parentMap.size);
          let nodeIndex = 0;

          // Add wrapper nodes first
          nodes.forEach(node => {
            const nodeId = node._id.toString();
            if (parentMap.has(nodeId)) {
              reactNodes[nodeIndex++] = {
                id: `wrapper-${nodeId}`,
                type: "group",
                data: { label: "ok" },
                position: { x: 0, y: 0 },
                style: { width: 50, height: 50, Background: 'transparent', border: '1px solid #ddd' },
              };
            }
          });

          // Add custom nodes
          nodes.forEach((node) => {
            const nodeId = node._id.toString();
            const hasChildren = parentMap.has(nodeId);
            const parentId = node.parent ? `wrapper-${node.parent.toString()}` : hasChildren ? `wrapper-${nodeId}` : undefined;
            reactNodes[nodeIndex++] = {
              id: nodeId,
              type: "custom",
              data: {
                id: nodeId,
                status: node.status,
                shortDesc: node.data.shortDesc,
                label: node.data.label,
                onExpand: node.isLeafNode ? expandNodeHandler : undefined,
                onUpdate: updateNodeHandler,
                onCollapse: node.isLeafNode ? undefined : toggleCollapse,
                onDownloadResources: downloadResourcesHandler,
                onDelete: async () => {
                  // Placeholder for node deletion
                },
                openDrawer: async () => {
                  try {
                    const { data } = await getNodeResources(
                      mindmapId,
                      node._id,
                      abortControllerRef.current.signal
                    );
                    // console.log("Fetched node resources:", data.resources);
                    openDrawer(data.resources || {}, node._id);
                  } catch (error) {
                    if (error.name !== "AbortError") {
                      showErrorToast("Failed to fetch node resources.");
                    }
                  }
                },
                
              },
              position: { x: 10, y: hasChildren ? 10 : 110 }, // Offset y for children to avoid overlap
              parentId,
              extent: parentId ? "parent" : undefined,
              ancestors: parentId ? [...(node.ancestors || []), parentId] : node.ancestors || [],
            };
          });

          // Validate edges in a single pass
          const validEdges = edges.filter(edge => {
            if (!edge.source || !edge.target) {
              console.warn(`Invalid edge: ${edge.id} has null source or target`);
              return false;
            }
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
              console.warn(`Edge ${edge.id} references non-existent node(s): source=${edge.source}, target=${edge.target}`);
              return false;
            }
            return true;
          });

          // Log invalid edges for debugging
          if (validEdges.length < edges.length) {
            console.warn(`Filtered out ${edges.length - validEdges.length} invalid edges`);
          }

          // Run Dagre layout
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            reactNodes,
            validEdges,
            { direction: "LR" } // Left-to-right layout
          );

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        },
        (error) => {
          if (error.name !== "AbortError") {
            console.error("Error fetching mindmap:", error);
            showErrorToast("Failed to fetch mindmap data.");
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
      expandNodeHandler,
      updateNodeHandler,
      toggleCollapse,
        downloadResourcesHandler, // Added so React re-creates this callback if it changes
    ]
  );

  useEffect(() => {
    fetchMindmap();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMindmap]);
};