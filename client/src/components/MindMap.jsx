import React, { useMemo, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useRoadmap } from "../hooks/useRoadmap";
import FlowComponent from "./FlowComponent";
import CustomDrawer from "./CustomDrawer";
import { ReactFlowProvider } from "@xyflow/react";

const MindMap = () => {
  const { mindmapId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  const openDrawer = useCallback((content) => {
    setDrawerContent(content);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerContent(null);
  }, []);

  const { nodes, onNodesChange, edges, onEdgesChange } = useRoadmap(
    mindmapId,
    openDrawer
  );

  const flowComponent = useMemo(
    () => (
      <FlowComponent
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    ),
    [nodes, edges, onNodesChange, onEdgesChange]
  );

  return (
    <div style={{ height: "100vh" }} className="z-100">
      <CustomDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        content={drawerContent}
      >
        <ReactFlowProvider>{flowComponent}</ReactFlowProvider>
      </CustomDrawer>
    </div>
  );
};

export default MindMap;

