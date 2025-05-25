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

    const toggleCollapse = useCallback(
        (nodeId) => {
            console.log("Toggling collapse for node:", nodeId);
            setCollapsedNodes((prev) => {
                const newSet = new Set(prev);
                const isExpanding = newSet.has(nodeId); // True if node is currently collapsed
                if (isExpanding) {
                    newSet.delete(nodeId); // Expand the node
                } else {
                    newSet.add(nodeId); // Collapse the node
                }

                // When expanding, focus on newly revealed nodes (children)
                if (isExpanding) {
                    // Find child nodes that will become visible
                    const childNodes = nodesRef.current.filter((node) => {
                        return edgesRef.current.some(
                            (edge) => edge.source === nodeId && edge.target === node.id
                        );
                    });

                    if (childNodes.length > 0) {
                        // Focus on the first child or all children
                        reactFlowInstance.fitView({ nodes: childNodes, duration: 500 });
                    } else {
                        // Fallback: focus on the expanded node if no children
                        reactFlowInstance.fitView({ nodes: [{ id: nodeId }], duration: 500 });
                    }
                } else {
                    // When collapsing, focus on the collapsed node as a fallback
                    reactFlowInstance.fitView({ nodes: [{ id: nodeId }], duration: 500 });
                }

                return newSet;
            });
        },
        [reactFlowInstance]
    );

    const { visibleNodes, visibleEdges } = useMemo(() => {
        const visibleNodes = nodes.filter((node) => {
            const ancestors = node.ancestors || [];
            return !ancestors.some((ancestorId) => collapsedNodes.has(ancestorId));
        });
        const visibleEdges = edges.filter(
            (edge) => visibleNodes.some((n) => n.id === edge.source) && visibleNodes.some((n) => n.id === edge.target)
        );
        return { visibleNodes, visibleEdges };
    }, [nodes, edges, collapsedNodes]);

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
            reactFlowInstance.fitView({ nodes: [{ id: nodeId }], duration: 500, maxZoom: 0.5 });
        },
        [reactFlowInstance]
    );

    return useMemo(
        () => ({
            nodes: visibleNodes,
            edges: visibleEdges,
            onNodesChange,
            onEdgesChange,
            onLayout,
            loading,
            focusNode,
            toggleCollapse,
            expandNodeHandler,
            updateNodeHandler,
        }),
        [visibleNodes, visibleEdges, onNodesChange, onEdgesChange, onLayout, loading, focusNode, toggleCollapse, expandNodeHandler, updateNodeHandler]
    );
};