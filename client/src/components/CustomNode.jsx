import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const CustomNode = React.memo(({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        className="node"
        style={{
          color: "white",
          background: "linear-gradient(145deg, #1e1e1e, #2d2d2d)",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          width: "200px",
          height: "100px",
          border: "1px solid #333",
          borderRadius: "8px",
          boxShadow: isHovered
            ? "0 6px 8px rgba(0, 0, 0, 0.2)"
            : "0 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          transform: isHovered ? "scale(1.05)" : "none",
          cursor: "move",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          title="Open details"
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "none",
            transition: "color 0.3s ease, text-decoration 0.3s ease",
            marginBottom: "10px",
          }}
          onClick={() => data.openDrawer()}
          onMouseEnter={(e) => {
            e.target.style.color = "#ff0072";
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#fff";
            e.target.style.textDecoration = "none";
          }}
        >
          {data.label}
        </button>
        <button
          title="Expand this node"
          onClick={() => data.onExpand(id)}
          style={{
            padding: "5px 10px",
            background: "transparent",
            color: "#ff0072",
            border: "1px solid #ff0072",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
            boxShadow: "0 0 5px rgba(255, 0, 114, 0.5)",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#ff0072";
            e.target.style.color = "#fff";
            e.target.style.boxShadow = "0 0 10px #ff0072";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#ff0072";
            e.target.style.boxShadow = "0 0 5px rgba(255, 0, 114, 0.5)";
          }}
        >
          <span style={{ marginRight: "5px" }}>+</span> Expand Node
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

export default CustomNode;