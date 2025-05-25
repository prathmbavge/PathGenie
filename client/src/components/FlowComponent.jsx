import React, { useRef } from "react";
import { ReactFlow, MiniMap, Controls, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import styles from "./FlowComponent.module.css";
import { FaSearch } from "react-icons/fa";

const nodeTypes = { custom: CustomNode };
const proOptions = { hideAttribution: true };

const FlowComponent = React.memo(
  ({ nodes, edges, onNodesChange, onEdgesChange, searchQuery, onSearch, onFocusNode }) => {
    const searchRef = useRef(null);

    const handleSearchClick = () => {
      searchRef.current.focus();
    };

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
          width="100%"
          minZoom={0.1}
          maxZoom={2}
        >
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "custom") {
                return node.data.status === "completed" ? "#4caf50" : "#2196f3";
              }
              return "#FFD580";
            }}
            nodeStrokeColor="orange"
            nodeStrokeWidth={3}
            onNodeClick={(event, node) => {
              onFocusNode(node.id);
              event.stopPropagation();
            }}
            style={{ backgroundColor: "transparent" }}
            zoomable
            pannable
          />
          <Controls orientation="horizontal" />
          <Panel position="top-left" className="backdrop-blur-md">
            <div className={styles.searchContainer}>
              <button
                className={styles.searchIconButton}
                onClick={handleSearchClick}
                aria-label="Search nodes"
              >
                <FaSearch className={styles.searchIcon} />
              </button>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={onSearch}
                placeholder="Search nodes..."
                className={styles.searchInput}
                aria-label="Search nodes input"
              />
            </div>
          </Panel>
        </ReactFlow>
      </div>
    );
  }
);

FlowComponent.displayName = "FlowComponent";

export default FlowComponent;