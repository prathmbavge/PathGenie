import { useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { updateNode } from "../../api/mindmapApi";


/**
 * Hook: useUpdateNode
 *
 * Provides a handler to update a specific node in a mindmap. This hook
 * manages the update operation by sending a request to the server to
 * update the node's data and then updates the local state with the
 * response. It also handles aborting ongoing update requests if a new
 * update is initiated.
 *
 * @param {string} mindmapId - The ID of the mindmap containing the node to be updated.
 * @param {React.MutableRefObject<Node[]>} nodesRef - A ref containing the current array of nodes.
 * @param {React.MutableRefObject<Edge[]>} edgesRef - A ref containing the current array of edges.
 * @param {React.Dispatch<React.SetStateAction<Node[]>>} setNodes - A state setter for the nodes array.
 * @param {React.Dispatch<React.SetStateAction<Edge[]>>} setEdges - A state setter for the edges array.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLoading - A state setter for the loading state.
 * 
 * @returns {function(nodeId: string, newData: Object): void} A callback to update a node by its ID with new data.
 */

export const useUpdateNode = (
  mindmapId,
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  setLoading
) => {
  const abortControllerRef = useRef(null);

  const updateNodeHandler = useCallback(
    async (nodeId, newData) => {
      if (!mindmapId || !nodesRef.current || !edgesRef.current) return;

      // Abort any ongoing update
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      await requestHandler(
        () =>
          updateNode(mindmapId, nodeId, newData, abortControllerRef.current.signal),
        setLoading,
        "Updating node...",
        async (res) => {
          // Update nodes in the state
          const updatedNodes = nodesRef.current.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...res.data.node.data } }
              : node
          );

          // Edges remain unchanged
          const updatedEdges = edgesRef.current;

          setNodes(updatedNodes);
          setEdges(updatedEdges);
        },
      );
    },
    [mindmapId, nodesRef, edgesRef, setLoading, setNodes, setEdges]
  );

  return updateNodeHandler;
};