// src/hooks/useRoadmap/useFetchMindmap.js
import { useEffect, useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { showErrorToast } from "../../../utils/toastUtils";
import { getMindmap, getNodeResources } from "../../api/mindmapApi";
import { getLayoutedElements, defaultElkOptions } from "../../../utils/layout";

/**
 * Hook: useFetchMindmap
 * - mindmapId: string | null
 * - setNodes, setEdges, setLoading: state setters from the parent hook.
 * - openDrawer: function to call when user clicks "Resources".
 */
export const useFetchMindmap = (mindmapId, setNodes, setEdges, setLoading, openDrawer, expandNodeHandler, updateNodeHandler) => {
    const abortControllerRef = useRef(null);

    const fetchMindmap = useCallback(async () => {
        if (!mindmapId) {
            showErrorToast("No mindmap ID provided.");
            return;
        }

        // Abort previous request if any:
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        await requestHandler(
            () => getMindmap(mindmapId, abortControllerRef.current.signal),
            setLoading,
            async (res) => {
                // console.log("Fetched mindmap data:", res.data.nodes);
                // Transform server nodes into React Flow nodes:
                const reactNodes = res.data.nodes.map((node) => ({
                    id: node._id.toString(),
                    type: "custom",
                    data: {
                        id: node._id.toString(),
                        status: node.status,
                        shortDesc: node.data.shortDesc,
                        label: node.data.label,
                        onExpand: node.isLeafNode ? expandNodeHandler : undefined,
                        onUpdate: updateNodeHandler,
                        onDelete: async () => {
                            // Handle node deletion here
                        },
                        openDrawer: async () => {
                            const { data } = await getNodeResources(
                                mindmapId,
                                node._id,
                                abortControllerRef.current.signal
                            );
                            console.log("Fetched node resources:", data.resources);
                            openDrawer(data.resources || {});
                        },
                    },
                    parent: node.parent || null,
                    position: { x: 0, y: 0 },
                }));
// console.log("React nodes:", reactNodes);
                // Generate edges from these nodes:
                const initialEdges = res.data.edges;

                // Apply initial layout (horizontal):
                const { nodes: layoutedNodes, edges: layoutedEdges } =
                    await getLayoutedElements(reactNodes, initialEdges, {
                        ...defaultElkOptions,
                        "elk.direction": "RIGHT",
                    });
                // console.log("Layouted nodes:", layoutedNodes);
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
    }, [mindmapId, setLoading, setNodes, setEdges, openDrawer, expandNodeHandler, updateNodeHandler]);

    // Run once when mindmapId first appears or changes:
    useEffect(() => {
        fetchMindmap();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchMindmap]);
};
