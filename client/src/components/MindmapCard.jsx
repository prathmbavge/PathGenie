import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlowCard from "./Cards/GlowCard";
import { MdPublic, MdLock, MdDelete } from "react-icons/md";
import { showErrorToast } from "../../utils/toastUtils";

const MindmapCard = ({ mindmap, onToggleVisibility, onDelete }) => {
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSwitchChange = useCallback(
    async (e) => {
      const newVisibility = e.target.checked ? "public" : "private";
      setToggling(true);
      try {
        await onToggleVisibility(mindmap._id, { visibility: newVisibility });
      } catch (err) {
        console.error("Failed to toggle visibility:", err);
        showErrorToast(
          `Failed to toggle visibility: ${err.message || "Unknown error"}`
        );
      } finally {
        setToggling(false);
      }
    },
    [mindmap._id, onToggleVisibility]
  );

  const handleDeleteClick = () => {
    const confirmDelete = () => {
      const userInput = window.prompt(
        `Please enter the title of the mindmap to confirm deletion:`
      );
      if (userInput === mindmap.title) {
        onDelete(mindmap._id);
      } else {
        showErrorToast("The title entered does not match. Deletion canceled.");
      }
    };
    confirmDelete();
  };

  return (
    <GlowCard
      key={mindmap._id}
      width="100%"
      maxWidth="340px"
      height="auto"
      padding="24px"
      className="mx-auto flex items-center justify-center relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete Icon */}
      
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          onClick={handleDeleteClick}
          title="Delete Mindmap"
        >
          <MdDelete size={22} />
        </button>
      

      <div className="flex flex-col items-center justify-center text-center">
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/mindmap/${mindmap._id}`)}
        >
          <h2 className="text-2xl font-bold text-white">{mindmap.title}</h2>

          <p className="text-gray-400 mt-2 text-sm">
            Created:{" "}
            {new Date(mindmap.createdAt).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-gray-400 mt-1 text-sm">
            Updated:{" "}
            {new Date(mindmap.updatedAt).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <p className="text-gray-400 mt-2">
            {mindmap.nodeCount} node{mindmap.nodeCount === 1 ? "" : "s"}
          </p>

          {mindmap.tags && mindmap.tags.length > 0 && (
            <p className="text-gray-400 mt-1 break-words text-center text-sm">
              {mindmap.tags.join(", ")}
            </p>
          )}
        </div>

        {/* Visibility Section */}
        <div className="mt-4 flex items-center justify-center border-1 p-2">
          <label
            htmlFor={`visibility-switch-${mindmap._id}`}
            className="text-white cursor-pointer flex items-center space-x-2"
            title={
              mindmap.visibility === "public"
                ? "Public Mindmap"
                : "Private Mindmap"
            }
          >
            <span>Visibility:</span>
            <div className="flex items-center justify-center">
              {mindmap.visibility === "public" ? (
                <MdPublic size={24} color="green" />
              ) : (
                <MdLock size={24} color="red" />
              )}
            </div>
          </label>
          <div className="relative">
            <input
              id={`visibility-switch-${mindmap._id}`}
              type="checkbox"
              className="sr-only"
              checked={mindmap.visibility === "public"}
              onChange={handleSwitchChange}
              disabled={toggling}
            />
          </div>
        </div>
      </div>
    </GlowCard>
  );
};

export default MindmapCard;
