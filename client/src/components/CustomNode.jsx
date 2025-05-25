import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Handle, Position } from "@xyflow/react";
import {
  FaChevronDown,
  FaCheck,
  FaBook,
  FaExternalLinkAlt,
  FaExpandAlt,
  FaCompressAlt,
} from "react-icons/fa";
import styles from "./CustomNode.module.css";

const STATUS = {
  LEARNING: "learning",
  COMPLETED: "completed",
};

const CustomNode = React.memo(({ data, selected }) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [status, setStatus] = useState(data.status || STATUS.LEARNING);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current && data.shortDesc) {
      descriptionRef.current.style.setProperty(
        "--content-height",
        `${descriptionRef.current.scrollHeight}px`
      );
    }
  }, [data.shortDesc]);

  const toggleStatus = useCallback(async () => {
    const newStatus =
      status === STATUS.COMPLETED ? STATUS.LEARNING : STATUS.COMPLETED;
    setStatus(newStatus);
    if (data.onUpdate) {
      try {
        await data.onUpdate(data.id, { status: newStatus });
      } catch (error) {
        setStatus(status);
        console.error("Failed to update status:", error);
      }
    }
  }, [data.onUpdate, data.id, status, setStatus]);

  const toggleDescription = useCallback(() => {
    setIsDescriptionVisible((prev) => !prev);
  }, []);

  const handleExpandCollapse = useCallback(() => {
    if (data.onCollapse) {
      data.onCollapse(data.id);
    } else if (data.onExpand) {
      data.onExpand(data.id);
    }
  }, [data.onCollapse, data.onExpand, data.id]);

  // Base styles that don't change
  const baseHandleStyle = {
    color: "#fff",
    width: "30px",
    height: "30px",
    transition: "all 0.2s ease",
    borderRadius: "0%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Function to compute dynamic colors based on hover and props
  const getHandleColors = (isHovered) => {
    if (data.onCollapse) {
      return {
        backgroundColor: isHovered ? "#f87171" : "#ef4444",
        borderColor: isHovered ? "#dc2626" : "#b91c1c",
      };
    }
    if (data.onExpand) {
      return {
        backgroundColor: isHovered ? "#4ade80" : "#22c55e",
        borderColor: isHovered ? "#16a34a" : "#15803d",
      };
    }
    return {
      backgroundColor: isHovered ? "#ff0072" : "#4b5563",
      borderColor: isHovered ? "#cc0060" : "#374151",
    };
  };

  // Memoized handle style, recomputed only when dependencies change
  const handleStyle = useMemo(
    () => ({
      ...baseHandleStyle,
      ...getHandleColors(isHovered),
    }),
    [isHovered, data.onCollapse, data.onExpand]
  );

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div
        className={`${styles.node} ${selected ? styles.selected : ""} ${
          data.highlighted ? styles.highlighted : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
        aria-label={`Node: ${data.label}`}
      >
        <div className={styles.header}>
          <div className={styles.leftGroup}>
            <button
              className={styles.statusButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus();
              }}
              aria-label={`Mark as ${
                status === STATUS.COMPLETED ? "Learning" : "Completed"
              }`}
            >
              {status === STATUS.COMPLETED ? (
                <FaCheck
                  className={styles.checkIcon}
                  title="Marked as Learning"
                />
              ) : (
                <FaBook
                  className={styles.bookIcon}
                  title="Marked as Completed"
                />
              )}
            </button>
          </div>
          <div className={styles.controls}>
            {data.shortDesc && (
              <button
                className={styles.descriptionToggle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDescription();
                }}
                aria-label={`${
                  isDescriptionVisible ? "Hide" : "Show"
                } description`}
              >
                <FaChevronDown
                  className={`${styles.chevron} ${
                    isDescriptionVisible ? styles.rotated : ""
                  }`}
                  title={`${
                    isDescriptionVisible ? "Hide" : "Show"
                  } description`}
                />
              </button>
            )}
            <button
              className={styles.resourceButton}
              onClick={(e) => {
                e.stopPropagation();
                if (data.openDrawer) {
                  data.openDrawer();
                }
              }}
              aria-label="Open resources"
            >
              <FaExternalLinkAlt
                className={styles.resourceIcon}
                title="Open resources"
              />
            </button>
          </div>
        </div>
        <hr className={styles.separator} />
        <div className={styles.label}>{data.label}</div>
        {data.shortDesc && (
          <div
            ref={descriptionRef}
            className={`${styles.description} ${
              isDescriptionVisible ? styles.visible : ""
            }`}
            aria-hidden={!isDescriptionVisible}
          >
            <div className={styles.descriptionContent}>{data.shortDesc}</div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        onClick={(e) => {
          e.stopPropagation();
          handleExpandCollapse();
        }}
      >
        <div className={styles.handleIcon}>
          {data.onCollapse ? (
            <FaCompressAlt
              size={25}
              className={styles.handleIconInner}
              title="Collapse"
            />
          ) : (
            <FaExpandAlt
              size={25}
              className={styles.handleIconInner}
              title="Expand"
            />
          )}
        </div>
      </Handle>
    </>
  );
});

export default CustomNode;
