import { useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { updateNode } from "../../api/mindmapApi";

/**
 * Hook: useUpdateNode
 * - mindmapId: string
 * - nodesRef, edgesRef: refs containing current arrays (always up-to-date)
 * - setNodes, setEdges, setLoading: state setters
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