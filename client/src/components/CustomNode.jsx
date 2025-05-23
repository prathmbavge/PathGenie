import React, { useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { FaChevronDown, FaCheck, FaBook, FaExternalLinkAlt } from "react-icons/fa";
import { RiMindMap } from "react-icons/ri";
import styles from "./CustomNode.module.css";

// Constants for status and colors
const STATUS = {
  LEARNING: "learning",
  COMPLETED: "completed",
};

const HANDLE_STYLE = {
  width: "10px",
  height: "10px",
  borderRadius: "0",
};

const CustomNode = React.memo(({ data, selected }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [status, setStatus] = useState(data.status || STATUS.LEARNING);
  const descriptionRef = useRef(null);

  // Update CSS custom property for description height
  useEffect(() => {
    if (descriptionRef.current && data.shortDesc) {
      descriptionRef.current.style.setProperty(
        "--content-height",
        `${descriptionRef.current.scrollHeight}px`
      );
    }
  }, [data.shortDesc]);

  // Memoized status toggle handler
  const toggleStatus = useCallback(async () => {
    const newStatus = status === STATUS.COMPLETED ? STATUS.LEARNING : STATUS.COMPLETED;
    setStatus(newStatus); // Optimistic update
    if (data.onUpdate) {
      try {
        await data.onUpdate(data.id, { status: newStatus });
      } catch (error) {
        setStatus(status); // Revert on error
        console.error("Failed to update status:", error);
      }
    }
  }, [data.onUpdate, data.id, status, setStatus]);

  // Memoized description toggle handler
  const toggleDescription = useCallback(() => {
    setIsDescriptionVisible((prev) => !prev);
  }, []);

  // Common handle style with dynamic background
  const getHandleStyle = (isHovered) => ({
    ...HANDLE_STYLE,
    backgroundColor: isHovered ? "#ff0072" : "#666",
  });

  return (
    <>
      <Handle type="target" position={Position.Left} style={getHandleStyle(isHovered)} />
      <div
        className={`${styles.node} ${selected ? styles.selected : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
        aria-label={`Node: ${data.label}`}
      >
        <div className={styles.header}>
          <button
            className={styles.statusButton}
            onClick={toggleStatus}
            title={status === STATUS.COMPLETED ? "Mark as Learning" : "Mark as Completed"}
            aria-label={status === STATUS.COMPLETED ? "Mark as Learning" : "Mark as Completed"}
          >
            {status === STATUS.COMPLETED ? (
              <FaCheck color="#4ade80" aria-hidden="true" />
            ) : (
              <FaBook color="#f472b6" aria-hidden="true" />
            )}
          </button>
          <div className={styles.controls}>
            <FaExternalLinkAlt
              className={`${styles.icon} ${isHovered ? styles.hoverEffect : ""}`}
              onClick={data.openDrawer}
              title="Open resources drawer"
              aria-label="Open resources drawer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && data.openDrawer()}
            />
            {data.shortDesc && (
              <FaChevronDown
                className={`${styles.icon} ${isDescriptionVisible ? styles.rotate : ""} ${
                  isHovered ? styles.hoverEffect : ""
                }`}
                onClick={toggleDescription}
                title={isDescriptionVisible ? "Hide description" : "Show description"}
                aria-label={isDescriptionVisible ? "Hide description" : "Show description"}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleDescription()}
              />
            )}
          </div>
        </div>
        <hr className={styles.separator} aria-hidden="true" />
        <div className={styles.label}>{data.label}</div>
        <hr className={styles.separator} aria-hidden="true" />
        {data.shortDesc && (
          <div
            className={`${styles.description} ${isDescriptionVisible ? styles.visible : styles.hidden}`}
            ref={descriptionRef}
            aria-hidden={!isDescriptionVisible}
          >
            <div className={styles.descriptionContent}>{data.shortDesc}</div>
          </div>
        )}
        {data.onExpand && isHovered && (
          <button
            className={styles.expandButton}
            onClick={() => data.onExpand(data.id)}
            title="Expand this node"
            aria-label="Expand this node"
          >
            <RiMindMap className={styles.expandIcon} aria-hidden="true" />
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={getHandleStyle(isHovered)} />
    </>
  );
});

export default CustomNode;