// src/hooks/useRoadmap/useLayout.js
import { useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { getLayoutedElements } from "../../../utils/layout";

/**
 * Returns a function `onLayout(direction)` that, when called, 
 * recomputes the layout of `nodesRef.current` and `edgesRef.current`.
 * 
 * - Uses a 300ms debounce to avoid rapid repeated calls.
 * - `direction` can be "HORIZONTAL" or "VERTICAL".
 */
export const useLayout = (nodesRef, edgesRef, setNodes, setEdges, setLoading) => {
  const debounced = useRef(
    debounce(async () => {
      const opts = { direction: "LR" };
      try {
        setLoading(true);
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(nodesRef.current, edgesRef.current, opts);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch {
        // Errors are handled inside getLayoutedElements
      } finally {
        setLoading(false);
      }
    }, 200),
  ).current;

  return useCallback(
    () => {
      debounced();
    },
    [debounced]
  );
};
