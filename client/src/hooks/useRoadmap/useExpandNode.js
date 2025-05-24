// src/hooks/useRoadmap/useExpandNode.js
import { useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { showErrorToast, showSuccessToast } from "../../../utils/toastUtils";
import { expandNode, getNodeResources } from "../../api/mindmapApi";
import { getLayoutedElements, defaultElkOptions } from "../../../utils/layout";

/**
 * Hook: useExpandNode
 * - mindmapId: string
 * - nodesRef, edgesRef: refs containing current arrays (always up-to-date)
 * - setNodes, setEdges, setLoading: state setters
 * - openDrawer: function to show resources when a leaf is clicked
 */
export const useExpandNode = (
    mindmapId,
    nodesRef,
    edgesRef,
    setNodes,
    setEdges,
    setLoading,
    openDrawer,
    updateNodeHandler
) => {
    const abortControllerRef = useRef(null);

    const expandNodeHandler = useCallback(
        async (nodeId) => {
            if (!mindmapId) return;

            // Abort any ongoing expansion:
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            await requestHandler(
                () =>
                    expandNode(mindmapId, nodeId, abortControllerRef.current.signal),
                setLoading,
                async (res) => {
                    // Create React Flow nodes from server response:
                    const fetchedNodes = res.data.newNodes.map((node) => ({
                        id: node._id.toString(),
                        type: "custom",
                        data: {
                            id: node._id.toString(),    
                            status: node.status,
                            shortDesc: node.data.shortDesc,
                            label: node.data.label,
                            onExpand: node.isLeafNode ? expandNodeHandler : undefined,
                            onUpdate: updateNodeHandler,
                            openDrawer: async () => {
                                const { data } = await getNodeResources(
                                    mindmapId,
                                    node._id,
                                    abortControllerRef.current.signal
                                );
                                openDrawer(data.resources || {});
                            },
                        },
                        parent: node.parent || null,
                        position: node.position || { x: 0, y: 0 },
                    }));

                    // Create edges—note that we only need edges for the new nodes.
                    // But we also want to include edges between existing nodes (e.g. if parent of new node is an existing node):
                    const mergedNodes = [...nodesRef.current, ...fetchedNodes];
                    const edges = [res.data.edges, ...edgesRef.current].flat();

                    // Re-run layout on the entire graph:
                    const { nodes: layoutedNodes, edges: layoutedEdges } =
                        await getLayoutedElements(mergedNodes, edges, {
                            ...defaultElkOptions,
                            "elk.direction": "RIGHT",
                        });

                    setNodes(layoutedNodes);
                    setEdges(layoutedEdges);
                    showSuccessToast("Node expanded successfully");
                },
                (error) => {
                    if (error.name !== "AbortError") {
                        console.error("Error expanding node:", error);
                        showErrorToast("Failed to expand node.");
                    }
                }
            );
        },
        [mindmapId, setLoading, setNodes, setEdges, openDrawer, nodesRef, edgesRef, updateNodeHandler]
    );

    return expandNodeHandler;
};
