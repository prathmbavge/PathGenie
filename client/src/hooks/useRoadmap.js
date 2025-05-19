import { useState, useEffect, useCallback, useRef } from "react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { requestHandler } from "../../utils/index";
import { showSuccessToast } from "../../utils/toast";
import { getMindmap, expandNode, getNodeResources } from "../api/mindmapApi";
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

// Optimized node lookup with a map
const getLayoutedElements = async (nodes, edges, options = {}) => {
  const isHorizontal = options['elk.direction'] === 'RIGHT';
  const nodeMap = nodes.reduce((acc, node) => ({ ...acc, [node.id]: node }), {});

  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map(node => ({ 
      id: node.id,
      width: node.width || 150,
      height: node.height || 50 
    })),
    edges: edges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target]
    }))
  };

  try {
    const layouted = await elk.layout(graph);
    const layoutedNodes = layouted.children.map(n => {
      const origNode = nodeMap[n.id];
      return origNode ? {
        ...origNode,
        position: { x: n.x, y: n.y },
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom'
      } : null;
    }).filter(Boolean);

    const layoutedEdges = layouted.edges.map(e => ({
      id: e.id,
      source: e.sources[0],
      target: e.targets[0]
    }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
  } catch (err) {
    console.error('ELK layout error:', err);
    return { nodes, edges };
  }
};

const useRoadmap = (mindmapId, openDrawer) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Refs to track current state without dependencies
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // Stable layout handler using refs
  const onLayout = useCallback(async (direction = 'VERTICAL') => {
    const opts = { 'elk.direction': direction, ...elkOptions };
    const { nodes: ln, edges: le } = await getLayoutedElements(
      nodesRef.current,
      edgesRef.current,
      opts
    );
    setNodes(ln);
    setEdges(le);
  }, []);

  const fetchMindmap = useCallback(async () => {
    if (!mindmapId) return;
    
    await requestHandler(
      () => getMindmap(mindmapId),
      setLoading,
      async (res) => {
        const reactNodes = res.data.nodes.map(node => ({
          id: node._id.toString(),
          type: "custom",
          data: {
            label: node.data.label,
            onExpand: expandNodeHandler,
            openDrawer: async () => {
              const { data } = await getNodeResources(mindmapId, node._id);
              openDrawer(data.resources || []);
            },
          },
          position: node.position,
        }));

        const newEdges = res.data.edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target
        }));

        // Apply initial layout directly
        const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
          reactNodes,
          newEdges,
          { ...elkOptions, 'elk.direction': 'DOWN' }
        );
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      },
      (error) => console.error("Error fetching mindmap:", error)
    );
  }, [mindmapId, openDrawer]);

  useEffect(() => { 
    fetchMindmap(); 
  }, [fetchMindmap]);

  const expandNodeHandler = useCallback(async (nodeId) => {
    await requestHandler(
      () => expandNode(mindmapId, nodeId),
      setLoading,
      async (res) => {
        const newNodes = res.data.newNodes.map(node => ({
          id: node._id.toString(),
          type: "custom",
          data: {
            label: node.data.label,
            onExpand: expandNodeHandler,
            openDrawer: async () => {
              const { data } = await getNodeResources(mindmapId, node._id);
              openDrawer(data.resources || []);
            },
          },
          position: node.position,
        }));

        const newEdges = res.data.edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target
        }));

        // Calculate layout with updated nodes/edges
        const updatedNodes = [...nodesRef.current, ...newNodes];
        const updatedEdges = [...edgesRef.current, ...newEdges];
        const { nodes: ln, edges: le } = await getLayoutedElements(
          updatedNodes,
          updatedEdges,
          { ...elkOptions, 'elk.direction': 'DOWN' }
        );

        setNodes(ln);
        setEdges(le);
        showSuccessToast("Node expanded successfully");
      },
      (error) => console.error("Error expanding node:", error)
    );
  }, [mindmapId, openDrawer]);

  // Event handlers
  const onNodesChange = useCallback(
    changes => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    changes => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );
  

  return { nodes, onNodesChange, edges, onEdgesChange, onLayout };
};

export default useRoadmap;