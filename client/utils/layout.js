// src/utils/layout.js
import ELK from "elkjs/lib/elk.bundled.js";
import { showErrorToast } from "./toastUtils";

const elk = new ELK();

// Default ELK options (you can tweak as needed)
export const defaultElkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "150",
  "elk.spacing.nodeNode": "100",
};

/**
 * Runs ELK layout on the given nodes and edges. Returns a new { nodes, edges } with position info.
 * @param {Array} nodes — Array of nodes in React Flow format ({ id, width?, height?, data, type, etc. }).
 * @param {Array} edges — Array of edges in React Flow format ({ id, source, target, ... }).
 * @param {Object} options — ELK layout options, e.g. { "elk.direction": "RIGHT" } or { ...defaultElkOptions }.
 */
export const getLayoutedElements = async (
  nodes,
  edges,
  options = {}
) => {
  // Determine if horizontal or vertical for source/target positions:
  const isHorizontal = options["elk.direction"] === "RIGHT";

  // Map original nodes by id, so we can re-assign data after layout:
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // Build the ELK graph in the required format:
  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width || 150,
      height: node.height || 50,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],

    })),
  };

  try {
    const layouted = await elk.layout(graph);

    // Reconstruct React Flow–style nodes:
    const layoutedNodes =
      layouted.children
        ?.map((n) => {
          const orig = nodeMap.get(n.id);
          if (!orig) return null;
          return {
            ...orig,
            position: { x: n.x ?? 0, y: n.y ?? 0 },
            targetPosition: isHorizontal ? "left" : "top",
            sourcePosition: isHorizontal ? "right" : "bottom",
          };
        })
        .filter((n) => n !== null) ?? [];

    // Reconstruct edges (mostly unchanged, but ensures order and all edge props):
    const layoutedEdges = layouted.edges?.map((e) => ({
      id: e.id,
      source: e.sources[0],
      target: e.targets[0],
      ...edges.find((edge) => edge.id === e.id),
    })) ?? edges;

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (err) {
    console.error("ELK layout error:", err);
    showErrorToast("Failed to compute layout. Using default positions.");
    // Fallback to original layout if ELK fails:
    return { nodes, edges };
  }
};

