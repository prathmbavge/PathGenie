// import React, { useMemo, useCallback, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useRoadmap } from "../hooks/useRoadmap";
// import FlowComponent from "./FlowComponent";
// import CustomDrawer from "./CustomDrawer";
// import { ReactFlowProvider } from "@xyflow/react";

// // Wrapper component to use useRoadmap within ReactFlowProvider
// const RoadmapWrapper = ({ mindmapId, openDrawer }) => {
//   const { nodes, onNodesChange, edges, onEdgesChange } = useRoadmap(mindmapId, openDrawer);

//   return (
//     <FlowComponent
//       nodes={nodes}
//       edges={edges}
//       onNodesChange={onNodesChange}
//       onEdgesChange={onEdgesChange}
//     />
//   );
// };

// const MindMap = () => {
//   const { mindmapId } = useParams();
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [drawerContent, setDrawerContent] = useState(null);

//   const openDrawer = useCallback((content) => {
//     setDrawerContent(content);
//     setIsDrawerOpen(true);
//   }, []);

//   const closeDrawer = useCallback(() => {
//     setIsDrawerOpen(false);
//     setDrawerContent(null);
//   }, []);

//   // Memoize the wrapped component to prevent unnecessary re-renders
//   const flowContent = useMemo(
//     () => (
//       <ReactFlowProvider>
//         <RoadmapWrapper mindmapId={mindmapId} openDrawer={openDrawer} />
//       </ReactFlowProvider>
//     ),
//     [mindmapId, openDrawer]
//   );

//   return (
//     <div style={{ height: "100vh" }} className="z-100">
//       <CustomDrawer
//         isOpen={isDrawerOpen}
//         onClose={closeDrawer}
//         content={drawerContent}
//       >
//         {flowContent}
//       </CustomDrawer>
//     </div>
//   );
// };

// export default MindMap;

// src/pages/MindMap.jsx
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import FlowComponent from "./FlowComponent";
import CustomDrawer from "./CustomDrawer";
import { useRoadmap } from "../hooks/useRoadmap";

// Wrapper component to use useRoadmap within ReactFlowProvider
// (unchanged, except it now receives `openDrawer` from above)
const RoadmapWrapper = ({
  mindmapId,
  openDrawer,
  setLoading,
  searchQuery,
  onSearch,
}) => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    focusNode,
  } = useRoadmap(mindmapId, openDrawer); // pass openDrawer into your hook

  // Memoize nodes with highlighting based on search query
  const updatedNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        highlighted: node.data.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      },
    }));
  }, [nodes, searchQuery]);

  // Focus on the first matched node when search query changes
  useEffect(() => {
    if (searchQuery) {
      const matchedNode = updatedNodes.find(
        (node) => node.data.highlighted
      );
      if (matchedNode) focusNode(matchedNode.id);
    }
  }, [searchQuery, updatedNodes, focusNode]);

  return (
    <FlowComponent
      nodes={updatedNodes}
      edges={edges}
      onNodesChange={setNodes}
      onEdgesChange={setEdges}
      searchQuery={searchQuery}
      onSearch={onSearch}
    />
  );
};

const MindMap = () => {
  const { mindmapId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [nodeId, setNodeId] = useState(null); // Store nodeId if needed
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 1️⃣ Define openDrawer here:
  const openDrawer = useCallback((resources, nodeId) => {
    setDrawerContent(resources);
    setNodeId(nodeId); // Store nodeId if needed
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerContent(null);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Pass only `resources` to openDrawer; FlowComponent/onNodeClick
  // const handleNodeClick = useCallback((resources) => {
  //   openDrawer(resources);
  // }, [openDrawer]);

  // Memoize the wrapped component
  const flowContent = useMemo(
    () => (
      <ReactFlowProvider>
        <RoadmapWrapper
          mindmapId={mindmapId}
          openDrawer={openDrawer}
          setLoading={setLoading}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
      </ReactFlowProvider>
    ),
    [mindmapId, openDrawer, searchQuery, handleSearch]
  );

  return (
    <div style={{ height: "100vh" }} className="z-100">
      <CustomDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        content={drawerContent}
        nodeId={nodeId}
        setLoading={setLoading}
      >
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="animate-spin h-10 w-10 border-4 border-t-neon-blue border-neon-blue/30 rounded-full" />
          </div>
        )}
        {flowContent}
      </CustomDrawer>
    </div>
  );
};

export default MindMap;
