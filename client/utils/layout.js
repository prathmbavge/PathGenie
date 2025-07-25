import dagre from "dagre";
import { showErrorToast } from "./toastUtils";

// Default Dagre options with increased spacing for clarity
export const defaultDagreOptions = {
  rankdir: "LR", // Left-to-right layout
  nodesep: 130, // Node separation
  edgesep: 50, // Edge separation
  ranksep: 200, // Separation between layers
  marginx: 50, // Margin on x-axis
  marginy: 50, // Margin on y-axis
  controlPoints: true,
};

/**
 * Runs Dagre layout on the given nodes and edges. Returns a new { nodes, edges } with position info.
 * @param {Array} nodes — Array of nodes in React Flow format ({ id, width?, height?, data, type, parentId?, extent? }).
 * @param {Array} edges — Array of edges in React Flow format ({ id, source, target, ... }).
 * @param {Object} options — Dagre layout options, e.g. { direction: "LR" }.
 */
export const getLayoutedElements = (nodes, edges, options = {}) => {
  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true, compound: true });
  const isHorizontal = options.direction === "LR" || defaultDagreOptions.rankdir === "LR";

  // Apply default and custom options
  const layoutOptions = { ...defaultDagreOptions, ...options };
  dagreGraph.setGraph(layoutOptions);

  // Create a map of nodes for O(1) lookups
  // const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // Calculate child counts for group nodes
  const childCounts = new Map();
  nodes.forEach((node) => {
    if (node.parentId) {
      childCounts.set(node.parentId, (childCounts.get(node.parentId) || 0) + 1);
    }
  });

  // Add nodes to Dagre graph with dynamic sizes for groups
  nodes.forEach((node) => {
    const isGroup = node.type === "group";
    const childCount = childCounts.get(node.id) || 0;
    const defaultNodeWidth = 150;
    const defaultNodeHeight = 50;
    const groupPadding = 10; // Padding inside group nodes
    const groupChildHeight = 60; // Estimated height per child (including spacing)

    // Set width and height
    const width = isGroup ? (node.style?.width || 300) : (node.width || defaultNodeWidth);
    const height = isGroup
      ? Math.max(node.style?.height || 300, childCount * groupChildHeight + groupPadding * 2)
      : (node.height || defaultNodeHeight);

    dagreGraph.setNode(node.id, { width, height });

    // Set parent-child relationships for groups
    if (node.parentId) {
      dagreGraph.setParent(node.id, node.parentId);
    }
  });

  // Add edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { id: edge.id });
  });

  try {
    // Run Dagre layout
    dagre.layout(dagreGraph);

    // Store absolute top-left positions for all nodes
    const absoluteTopLefts = new Map();
    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      if (nodeWithPosition) {
        const width = nodeWithPosition.width;
        const height = nodeWithPosition.height;
        const topLeftX = nodeWithPosition.x - width / 2;
        const topLeftY = nodeWithPosition.y - height / 2;
        absoluteTopLefts.set(node.id, { x: topLeftX, y: topLeftY });
      }
    });

    // Construct layouted nodes with correct positions and sizes
    const layoutedNodes = nodes.map((node) => {
      const absoluteTopLeft = absoluteTopLefts.get(node.id);
      if (!absoluteTopLeft) {
        console.warn(`Node ${node.id} not found in Dagre layout`);
        return node;
      }

      // Default position is absolute top-left
      let position = { x: absoluteTopLeft.x, y: absoluteTopLeft.y };

      // Adjust position for child nodes relative to parent's top-left
      if (node.parentId) {
        const parentAbsoluteTopLeft = absoluteTopLefts.get(node.parentId);
        if (parentAbsoluteTopLeft) {
          position = {
            x: absoluteTopLeft.x - parentAbsoluteTopLeft.x,
            y: absoluteTopLeft.y - parentAbsoluteTopLeft.y,
          };
        } else {
          console.warn(`Parent ${node.parentId} not found for node ${node.id}`);
        }
      }

      const isGroup = node.type === "group";
      const childCount = childCounts.get(node.id) || 0;
      const groupPadding = 20;
      const groupChildHeight = 60;

      const updatedNode = {
        ...node,
        position,
        targetPosition: isHorizontal ? "left" : "top",
        sourcePosition: isHorizontal ? "right" : "bottom",
      };

      // Update group node size based on Dagre's computed dimensions and child count
      if (isGroup) {
        const nodeWithPosition = dagreGraph.node(node.id);
        updatedNode.style = {
          ...node.style,
          width: nodeWithPosition.width,
          height: Math.max(
            nodeWithPosition.height,
            childCount * groupChildHeight + groupPadding * 2
          ),
          padding: "5px",
        };
      }

      return updatedNode;
    });

    // Reconstruct edges, preserving original properties
    const layoutedEdges = edges.map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (err) {
    console.error("Dagre layout error:", err);
    showErrorToast("Failed to compute layout. Using default positions.");
    return { nodes, edges };
  }
}