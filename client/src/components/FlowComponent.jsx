import React from "react";
import { ReactFlow, MiniMap, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";

const nodeTypes = { custom: CustomNode };
const proOptions = { hideAttribution: true };


const FlowComponent = ({ nodes, edges, onNodesChange, onEdgesChange }) => {
  return (
    <div style={{ height: "100vh" }} className="z-100 text-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={proOptions}
        width={"100%"}
        minZoom={0.1}
        maxZoom={2}

      >
        <MiniMap
          nodeColor={(node) => node.color || "#ff0072"}
          nodeStrokeWidth={3}
          style={{ backgroundColor: "transparent" }}
          zoomable
          pannable
        />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default FlowComponent;