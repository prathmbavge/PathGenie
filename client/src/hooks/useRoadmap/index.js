// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { applyNodeChanges, applyEdgeChanges, useReactFlow } from "@xyflow/react";
// import { useFetchMindmap } from "./useFetchMindmap";
// import { useExpandNode } from "./useExpandNode";
// import { useUpdateNode } from "./useUpdateNode";
// import { useLayout } from "./useLayout";

// /**
//  * Main hook: useRoadmap
//  * - mindmapId: string (required)
//  * - openDrawer: function to open a side drawer with resources
//  *
//  * Returns:
//  * {
//  *   nodes,
//  *   edges,
//  *   onNodesChange,
//  *   onEdgesChange,
//  *   onLayout,
//  *   loading,
//  *   focusNode,
//  *   toggleCollapse
//  * }
//  */
// export const useRoadmap = (mindmapId, openDrawer) => {
//     // State for nodes, edges, loading, and collapsed nodes
//     const [nodes, setNodes] = useState([]);
//     const [edges, setEdges] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [collapsedNodes, setCollapsedNodes] = useState(new Set());

//     // Refs to keep latest nodes/edges
//     const nodesRef = useRef(nodes);
//     const edgesRef = useRef(edges);

//     // React Flow instance for viewport control
//     const reactFlowInstance = useReactFlow();

//     // Keep refs in sync with state
//     useEffect(() => {
//         nodesRef.current = nodes;
//     }, [nodes]);
//     useEffect(() => {
//         edgesRef.current = edges;
//     }, [edges]);

//         // Function to toggle collapse/expand of a node
//     const toggleCollapse = useCallback(
//         (nodeId) => {
//             console.log("Toggling collapse for node:", nodeId),
//             setCollapsedNodes((prev) => {
//                 const newSet = new Set(prev);
//                 if (newSet.has(nodeId)) {
//                     newSet.delete(nodeId);
//                 } else {
//                     newSet.add(nodeId);
//                 }
//                 return newSet;
//             });
//         },
//         []
//     );

//     // Memoized function to get visible nodes and edges
//     const { visibleNodes, visibleEdges } = useMemo(() => {
//         const visibleNodes = nodes.filter((node) => {
//             // Check if any ancestor is collapsed
//             const ancestors = node.ancestors || [];
//             return !ancestors.some((ancestorId) => collapsedNodes.has(ancestorId));
//         });
//         const visibleEdges = edges.filter(
//             (edge) => visibleNodes.some((n) => n.id === edge.source) && visibleNodes.some((n) => n.id === edge.target)
//         );
//         return { visibleNodes, visibleEdges };
//     }, [nodes, edges, collapsedNodes]);


//     // Instantiate handlers
//     const updateNodeHandler = useUpdateNode(
//         mindmapId,
//         nodesRef,
//         edgesRef,
//         setNodes,
//         setEdges,
//         setLoading
//     );

//     const expandNodeHandler = useExpandNode(
//         mindmapId,
//         nodesRef,
//         edgesRef,
//         setNodes,
//         setEdges,
//         setLoading,
//         openDrawer,
//         updateNodeHandler,
//         toggleCollapse
//     );

//     // Fetch initial mindmap
//     useFetchMindmap(
//         mindmapId,
//         setNodes,
//         setEdges,
//         setLoading,
//         openDrawer,
//         expandNodeHandler,
//         updateNodeHandler,
//         toggleCollapse
//     );

//     // Layout handler
//     const onLayout = useLayout(nodesRef, edgesRef, setNodes, setEdges, setLoading);

//     // Handlers for node/edge changes with autofocusing
//     const onNodesChange = useCallback(
//         (changes) => {
//             setNodes((nds) => applyNodeChanges(changes, nds));
//             const addedNode = changes.find((change) => change.type === "add");
//             const selectedNode = changes.find((change) => change.type === "select" && change.selected);
//             if (addedNode) {
//                 reactFlowInstance.fitView({ nodes: [{ id: addedNode.item.id }], duration: 500 });
//             } else if (selectedNode) {
//                 reactFlowInstance.fitView({ nodes: [{ id: selectedNode.id }], duration: 500 });
//             }
//         },
//         [setNodes, reactFlowInstance]
//     );

//     const onEdgesChange = useCallback(
//         (changes) => {
//             setEdges((eds) => applyEdgeChanges(changes, eds));
//         },
//         [setEdges]
//     );

//     // Function to focus on a specific node
//     const focusNode = useCallback(
//         (nodeId) => {
//             reactFlowInstance.fitView({ nodes: [{ id: nodeId }], duration: 500 });
//         },
//         [reactFlowInstance]
//     );

//     // Memoize the hook return value
//     return useMemo(
//         () => ({
//             nodes: visibleNodes,
//             edges: visibleEdges,
//             onNodesChange,
//             onEdgesChange,
//             onLayout,
//             loading,
//             focusNode,
//             toggleCollapse,
//             expandNodeHandler,
//             updateNodeHandler,
//         }),
//         [visibleNodes, visibleEdges, onNodesChange, onEdgesChange, onLayout, loading, focusNode, toggleCollapse, expandNodeHandler, updateNodeHandler]
//     );
// };

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { applyNodeChanges, applyEdgeChanges, useReactFlow } from "@xyflow/react";
import { useFetchMindmap } from "./useFetchMindmap";
import { useExpandNode } from "./useExpandNode";
import { useUpdateNode } from "./useUpdateNode";
import { useLayout } from "./useLayout";

// Helper function to compute full ancestor sets for all nodes
const computeAncestors = (nodes, edges) => {
    const ancestorMap = new Map();

    // Initialize ancestor sets
    nodes.forEach((node) => {
        ancestorMap.set(node.id, new Set());
    });

    // Build adjacency list for parent lookup (from edges and node.parentId)
    const parentMap = new Map();

    // From edges (custom nodes)
    edges.forEach((edge) => {
        if (!parentMap.has(edge.target)) {
            parentMap.set(edge.target, []);
        }
        parentMap.get(edge.target).push(edge.source);
    });

    // From node.parentId (for group and custom nodes)
    nodes.forEach((node) => {
        if (node.parentId) {
            if (!parentMap.has(node.id)) {
                parentMap.set(node.id, []);
            }
            parentMap.get(node.id).push(node.parentId);
        }
    });

    // DFS to compute full ancestor set for each node
    const getAncestors = (nodeId, visited = new Set()) => {
        if (visited.has(nodeId)) return; // Avoid cycles
        visited.add(nodeId);

        const ancestors = ancestorMap.get(nodeId);
        const parents = parentMap.get(nodeId) || [];

        parents.forEach((parentId) => {
            ancestors.add(parentId);
            getAncestors(parentId, visited);
            // Add all ancestors of the parent
            ancestorMap.get(parentId).forEach((ancestorId) => ancestors.add(ancestorId));
        });
    };

    nodes.forEach((node) => {
        getAncestors(node.id);
    });

    return ancestorMap;
};

export const useRoadmap = (mindmapId, openDrawer) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [collapsedNodes, setCollapsedNodes] = useState(new Set());

    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    const reactFlowInstance = useReactFlow();

    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    useEffect(() => {
        edgesRef.current = edges;
    }, [edges]);

    // Compute ancestor map whenever nodes or edges change
    const ancestorMap = useMemo(() => computeAncestors(nodes, edges), [nodes, edges]);

    const toggleCollapse = useCallback(
        (nodeId) => {
            console.log("Toggling collapse for node:", nodeId);
            setCollapsedNodes((prev) => {
                const newSet = new Set(prev);
                const isExpanding = newSet.has(nodeId); // True if node is currently collapsed
                if (isExpanding) {
                    newSet.delete(nodeId); // Expand the node
                    // Find child nodes (custom nodes connected via edges)
                    const childNodes = nodes.filter((node) =>
                        edges.some((edge) => edge.source === nodeId && edge.target === node.id)
                    );
                    // Filter for visible child nodes (not collapsed by other ancestors)
                    const visibleChildNodes = childNodes.filter((child) => {
                        const ancestors = ancestorMap.get(child.id) || new Set();
                        return !ancestors.size || !Array.from(ancestors).some((ancestorId) => newSet.has(ancestorId));
                    });
                    // Focus on the first visible child or the expanded node
                    const focusNodeId = visibleChildNodes.length > 0 ? visibleChildNodes[0].id : nodeId;
                    reactFlowInstance.fitView({ nodes: [{ id: focusNodeId }], duration: 500, maxZoom: 0.6 });
                } else {
                    newSet.add(nodeId); // Collapse the node
                    // Focus on the collapsed node
                    reactFlowInstance.fitView({ nodes: [{ id: nodeId }], duration: 500, maxZoom: 0.4 });
                }
                return newSet;
            });
        },
        [reactFlowInstance, nodes, edges, ancestorMap]
    );

    const { visibleNodes, visibleEdges } = useMemo(() => {
        // Step 1: Compute visible custom nodes (exclude group nodes)
        const visibleCustomNodes = nodes.filter((node) => {
            if (node.type === "group") return false;
            const ancestors = ancestorMap.get(node.id) || new Set();
            return !ancestors.size || !Array.from(ancestors).some((ancestorId) => collapsedNodes.has(ancestorId));
        });

        // Create a Set of visible custom node IDs for O(1) lookups
        const visibleCustomNodeIds = new Set(visibleCustomNodes.map((n) => n.id));

        // Step 2: Compute visible group nodes (hide if all children are hidden)
        const visibleGroupNodes = nodes.filter((node) => {
            if (node.type !== "group") return false;
            // Find all children of this group node
            const children = nodes.filter((n) => n.parentId === node.id);
            // Group node is visible if at least one child is visible
            return children.some((child) => visibleCustomNodeIds.has(child.id));
        });

        // Step 3: Combine visible nodes with group nodes first
        const visibleNodes = [...visibleGroupNodes, ...visibleCustomNodes];

        // Step 4: Filter edges based on visible custom nodes
        const visibleEdges = edges.filter(
            (edge) => visibleCustomNodeIds.has(edge.source) && visibleCustomNodeIds.has(edge.target)
        );

        return { visibleNodes, visibleEdges };
    }, [nodes, edges, collapsedNodes, ancestorMap]);

    const updateNodeHandler = useUpdateNode(
        mindmapId,
        nodesRef,
        edgesRef,
        setNodes,
        setEdges,
        setLoading
    );

    const expandNodeHandler = useExpandNode(
        mindmapId,
        nodesRef,
        edgesRef,
        setNodes,
        setEdges,
        setLoading,
        openDrawer,
        updateNodeHandler,
        toggleCollapse
    );

    useFetchMindmap(
        mindmapId,
        setNodes,
        setEdges,
        setLoading,
        openDrawer,
        expandNodeHandler,
        updateNodeHandler,
        toggleCollapse
    );

    const onLayout = useLayout(nodesRef, edgesRef, setNodes, setEdges, setLoading);

    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
            const addedNode = changes.find((change) => change.type === "add");
            const selectedNode = changes.find((change) => change.type === "select" && change.selected);
            if (addedNode) {
                reactFlowInstance.fitView({ nodes: [{ id: addedNode.item.id }], duration: 500, maxZoom: 0.5 });
            } else if (selectedNode) {
                reactFlowInstance.fitView({ nodes: [{ id: selectedNode.id }], duration: 500, maxZoom: 0.5 });
            }
        },
        [setNodes, reactFlowInstance]
    );

    const onEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        [setEdges]
    );

    const focusNode = useCallback(
        (nodeId) => {
            reactFlowInstance.fitView({ nodes: [{ id: nodeId }], duration: 500 });
        },
        [reactFlowInstance]
    );

    return useMemo(
        () => ({
            nodes: visibleNodes,
            edges: visibleEdges,
            onNodesChange,
            onEdgesChange,
            setNodes,
            setEdges,
            onLayout,
            loading,
            focusNode,
            toggleCollapse,
            expandNodeHandler,
            updateNodeHandler,
        }),
        [
            visibleNodes,
            visibleEdges,
            onNodesChange,
            onEdgesChange,
            onLayout,
            loading,
            focusNode,
            toggleCollapse,
            expandNodeHandler,
            updateNodeHandler,
        ]
    );
};