
import { useEffect, useRef, useCallback } from "react";
import { requestHandler } from "../../../utils/index";
import { showErrorToast } from "../../../utils/toastUtils";
import { getMindmap, getNodeResources } from "../../api/mindmapApi";
import { getLayoutedElements } from "../../../utils/layout";
import { useSession } from "../../lib/auth-client";


/**
 * Hook: useFetchMindmap
 * 
 * Fetches and processes a mindmap based on the given mindmapId. The hook manages the state
 * of the nodes and edges to be displayed using React Flow. It also handles various callbacks 
 * for node interaction such as expanding, updating, collapsing, and downloading resources.
 * 
 * @param {string|null} mindmapId - The ID of the mindmap to fetch.
 * @param {Function} setNodes - State setter function to update the nodes.
 * @param {Function} setEdges - State setter function to update the edges.
 * @param {Function} setLoading - State setter to manage the loading state.
 * @param {Function} openDrawer - Function to open a drawer with node resources.
 * @param {Function} expandNodeHandler - Callback to handle node expansion.
 * @param {Function} updateNodeHandler - Callback to handle node updates.
 * @param {Function} toggleCollapse - Callback to toggle node collapse state.
 * @param {Function} downloadResourcesHandler - Callback to handle downloading node resources.
 */


export const useFetchMindmap = (
  mindmapId,
  setNodes,
  setEdges,
  setLoading,
  openDrawer,
  expandNodeHandler,
  updateNodeHandler,
  toggleCollapse,
  downloadResourcesHandler
) => {
  const abortControllerRef = useRef(null);

  const { data: session } = useSession();

  const fetchMindmap = useCallback(
    () => {
      if (!mindmapId) {
        showErrorToast("No mindmap ID provided.");
        return;
      }

      // Abort any previous fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      requestHandler(
        () => getMindmap(mindmapId, abortControllerRef.current.signal),
        setLoading,
        "Fetching mindmap...",
        (res) => {
          const nodes = res.data.nodes;
          const edges = res.data.edges;
          const ownerId = res.data.ownerId;
          // console.log("Fetched mindmap nodes:", nodes);
          // console.log("Fetched mindmap edges:", edges);

          // Single-pass parent mapping and node ID set
          const parentMap = new Map();
          const nodeIds = new Set();
          nodes.forEach(node => {
            nodeIds.add(node._id.toString());
            if (node.parent) {
              parentMap.set(node.parent.toString(), true);
            }
          });

          // Pre-allocate array for performance
          const reactNodes = new Array(nodes.length + parentMap.size);
          let nodeIndex = 0;

          // Add wrapper nodes first
          nodes.forEach(node => {
            const nodeId = node._id.toString();
            if (parentMap.has(nodeId)) {
              reactNodes[nodeIndex++] = {
                id: `wrapper-${nodeId}`,
                type: "group",
                data: { label: "ok" },
                position: { x: 0, y: 0 },
                style: { width: 50, height: 50, Background: 'transparent', border: '1px solid #ddd' },
              };
            }
          });

          // Add custom nodes
          nodes.forEach((node) => {
            const nodeId = node._id.toString();
            const hasChildren = parentMap.has(nodeId);
            const parentId = node.parent ? `wrapper-${node.parent.toString()}` : hasChildren ? `wrapper-${nodeId}` : undefined;
            reactNodes[nodeIndex++] = {
              id: nodeId,
              type: "custom",
              data: {
                id: nodeId,
                status: session?.user?.id === ownerId ? node.status : undefined,
                shortDesc: node.data.shortDesc,
                label: node.data.label,
                onExpand: node.isLeafNode ? ((session?.user?.id === ownerId) ? expandNodeHandler : undefined) : undefined,
                onUpdate: session?.user?.id === ownerId ? updateNodeHandler : undefined,
                onCollapse: node.isLeafNode ? undefined : toggleCollapse,
                onDownloadResources: downloadResourcesHandler,
                onDelete: async () => {
                  // Placeholder for node deletion
                },
                openDrawer: () => {
                  requestHandler(
                    () => getNodeResources(mindmapId, node._id, abortControllerRef.current.signal),
                    setLoading,
                    "Fetching node resources...",
                    (res) => openDrawer(res.data.resources || {}, node._id)
                  )
                },

              },
              position: { x: 10, y: hasChildren ? 10 : 110 }, // Offset y for children to avoid overlap
              parentId,
              extent: parentId ? "parent" : undefined,
              ancestors: parentId ? [...(node.ancestors || []), parentId] : node.ancestors || [],
            };
          });

          // Validate edges in a single pass
          const validEdges = edges.filter(edge => {
            if (!edge.source || !edge.target) {
              console.warn(`Invalid edge: ${edge.id} has null source or target`);
              return false;
            }
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
              console.warn(`Edge ${edge.id} references non-existent node(s): source=${edge.source}, target=${edge.target}`);
              return false;
            }
            return true;
          });

          // Log invalid edges for debugging
          if (validEdges.length < edges.length) {
            console.warn(`Filtered out ${edges.length - validEdges.length} invalid edges`);
          }

          // Run Dagre layout
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            reactNodes,
            validEdges,
            { direction: "LR" } // Left-to-right layout
          );

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        },

      );
    },
    [
      mindmapId,
      setLoading,
      setNodes,
      setEdges,
      openDrawer,
      expandNodeHandler,
      updateNodeHandler,
      toggleCollapse,
      downloadResourcesHandler, // Added so React re-creates this callback if it changes
      session
    ]
  );

  useEffect(() => {
    // console.log("useFetchMindmap effect triggered for mindmapId:", mindmapId);
    fetchMindmap();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
};