import { useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { showErrorToast } from "../../../utils/toastUtils";
import { expandNode, getNodeResources } from "../../api/mindmapApi";
import { getLayoutedElements } from "../../../utils/layout";


/**
 * Hook: useExpandNode
 *
 * Given a node ID, expands it by retrieving its children from the server
 * and adding them to the graph. Also updates the node's `onCollapse` handler
 * to toggle its collapsed state.
 *
 * @param {string} mindmapId - The ID of the mindmap containing the node to be expanded.
 * @param {React.MutableRefObject<Node[]>} nodesRef - A ref containing the current array of nodes.
 * @param {React.MutableRefObject<Edge[]>} edgesRef - A ref containing the current array of edges.
 * @param {React.Dispatch<React.SetStateAction<Node[]>>} setNodes - A state setter for the nodes array.
 * @param {React.Dispatch<React.SetStateAction<Edge[]>>} setEdges - A state setter for the edges array.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLoading - A state setter for the loading state.
 * @param {function(resources: any, nodeId: string): void} openDrawer - A callback to open the resources drawer when a leaf node is clicked.
 * @param {function(nodeId: string): void} updateNodeHandler - A callback to update a node when its status is changed.
 * @param {function(nodeId: string): void} toggleCollapse - A callback to toggle the collapsed state of a node.
 *
 * @returns {function(nodeId: string): void} A callback to expand a node by its ID.
 */
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
    (nodeId) => {
      if (!mindmapId) return;

      // Abort any ongoing expansion
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      requestHandler(
        () => expandNode(mindmapId, nodeId, abortControllerRef.current.signal),
        setLoading,
        "Expanding node...",
        (res) => {
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
              onUpdate:  updateNodeHandler,
              onCollapse: node.isLeafNode ? undefined : toggleCollapse,
              openDrawer:  () => {
                requestHandler(
                  () => getNodeResources(mindmapId, node._id, abortControllerRef.current.signal),
                  setLoading,
                  "Fetching node resources...",
                  (res) => openDrawer(res.data.resources || {}, node._id)
                )
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