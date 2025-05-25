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

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import FlowComponent from "./FlowComponent";
import CustomDrawer from "./CustomDrawer";
import { useRoadmap } from "../hooks/useRoadmap";
import debounce from "lodash/debounce";


const RoadmapWrapper = React.memo(
  ({ mindmapId, openDrawer, setLoading, searchQuery, onSearch }) => {
    const { nodes, edges, focusNode, onEdgesChange, onNodesChange } = useRoadmap(mindmapId, openDrawer);

    // Compute highlighted nodes based on search query
    const highlightedNodes = useMemo(() => {
      if (!searchQuery) {
        return nodes.map((node) => ({
          ...node,
          data: { ...node.data, highlighted: false },
        }));
      }
      const lowerQuery = searchQuery.toLowerCase();
      return nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          highlighted: node.data.label.toLowerCase().includes(lowerQuery),
        },
      }));
    }, [nodes, searchQuery]);

    // Debounced focus on first matched node
    const debouncedFocusNode = useMemo(
      () =>
        debounce((nodes, focusNode) => {
          const matchedNode = nodes.find((node) => node.data.highlighted);
          if (matchedNode) {
            focusNode(matchedNode.id);
          }
        }, 300),
      [focusNode]
    );

    // Trigger focus when searchQuery or highlightedNodes change
    useEffect(() => {
      debouncedFocusNode(highlightedNodes, focusNode);
      return () => {
        debouncedFocusNode.cancel(); // Cleanup debounce on unmount or change
      };
    }, [searchQuery, highlightedNodes, debouncedFocusNode]);

    return (
      <FlowComponent
        nodes={highlightedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        searchQuery={searchQuery}
        onSearch={onSearch}
        onFocusNode={focusNode}
      />
    );
  }
);

RoadmapWrapper.displayName = "RoadmapWrapper";

const MindMap = () => {
  const { mindmapId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle search input without debouncing
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value); // Update search query immediately
  }, []);

  const openDrawer = useCallback((resources, nodeId) => {
    setDrawerContent(resources);
    setNodeId(nodeId);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerContent(null);
    setNodeId(null);
  }, []);

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