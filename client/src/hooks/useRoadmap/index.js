// src/hooks/useRoadmap/index.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { useFetchMindmap } from "./useFetchMindmap";
import { useExpandNode } from "./useExpandNode";
import { useUpdateNode } from "./useUpdateNode";
import { useLayout } from "./useLayout";

/**
 * Main hook: useRoadmap
 * - mindmapId: string (required)
 * - openDrawer: function to open a side drawer with resources
 *
 * Returns:
 * {
 *   nodes,
 *   edges,
 *   onNodesChange,
 *   onEdgesChange,
 *   onLayout(direction),
 *   loading
 * }
 */
export const useRoadmap = (mindmapId, openDrawer) => {
    // 1) State for nodes, edges, loading
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);

    // 2) Refs to keep latest nodes/edges
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    // Keep refs in sync with state:
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);
    useEffect(() => {
        edgesRef.current = edges;
    }, [edges]);

    // 3) Instantiate the expandNodeHandler BEFORE fetching
    const expandNodeHandler = useExpandNode(
        mindmapId,
        nodesRef,
        edgesRef,
        setNodes,
        setEdges,
        setLoading,
        openDrawer
    );

    // 4) Instantiate the updateNodeHandler BEFORE fetching
    const updateNodeHandler = useUpdateNode(
        mindmapId,
        nodesRef,
        edgesRef,
        setNodes,
        setEdges,
        setLoading
    )

    // 4) Fetch initial mindmap, now passing expandNodeHandler as the last argument
    useFetchMindmap(
        mindmapId,
        setNodes,
        setEdges,
        setLoading,
        openDrawer,
        expandNodeHandler,
        updateNodeHandler
    );

    // 5) Layout handler:
    const onLayout = useLayout(nodesRef, edgesRef, setNodes, setEdges, setLoading);

    // 6) Handlers for user moving/resizing nodes/edges
    const onNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        [setNodes]
    );

    const onEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        [setEdges]
    );

    // 7) Memoize the hook return value so that consumers don't re-render needlessly:
    return useMemo(
        () => ({
            nodes,
            edges,
            onNodesChange,
            onEdgesChange,
            onLayout,
            loading,
            expandNodeHandler, // if you want to expose it directly
            updateNodeHandler, // if you want to expose it directly
        }),
        [nodes, edges, onNodesChange, onEdgesChange, onLayout, loading, expandNodeHandler, updateNodeHandler]
    );
};
