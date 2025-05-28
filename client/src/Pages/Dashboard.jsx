import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GradientInput from "../components/Input/GradientInput";
import { BsMagic } from "react-icons/bs";
import MindmapCard from "../components/MindmapCard";
import SlideButton from "../components/Buttons/SlideButton";

import { requestHandler } from "../../utils/index";
import { showErrorToast } from "../../utils/toastUtils";

import { useSession } from "../lib/auth-client";
import {
  createMindmap,
  getAllMindmaps,
  updateMindmap,
  deleteMindmap,
} from "../api/mindmapApi";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState([]);
  const [title, setTitle] = useState("");
  // const [a, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const { data: session } = useSession();

  // Create a new mindmap
  const handleCreateMindmap = useCallback(async () => {
    if (!title.trim()) {
      showErrorToast("Please enter a title.");
      return;
    }
    await requestHandler(
      async () => createMindmap(title.trim()),
      setLoading,
      "Creating mindmap...",
      (res) => {
        const newMindmap = res.data.mindmap;
        setMindmaps((prev) => [...prev, newMindmap]);
        navigate(`/mindmap/${newMindmap._id}`, {
          state: { mindmap: newMindmap },
        });
      }
    );
  }, [navigate, title]);

  // Fetch all mindmaps on mount
  useEffect(() => {
    const fetchMindmaps = () => {
      setLoading(true);

      requestHandler(
        () => getAllMindmaps(),
        setLoading,
        "Fetching mindmaps...",
        (res) => {
          const fetchedMindmaps = res.data.mindmaps;
          // setIsOwner(fetchMindmaps.owner === session.user.id);
          setMindmaps(fetchedMindmaps);
        },
        null,
        false
      );
    };

    fetchMindmaps();
  }, []);

  // Update a mindmap (e.g., visibility toggle)
  const handleUpdateMindmap = useCallback((mindmapId, updates) => {
    requestHandler(
      () => updateMindmap(mindmapId, updates),
      setLoading,
      "Updating mindmap...",
      (res) => {
        const updatedMindmap = res.data.mindmap;
        setMindmaps((prev) =>
          prev.map((m) => (m._id === updatedMindmap._id ? updatedMindmap : m))
        );
      }
    );
  }, []);

  const handleDeleteMindmap = useCallback((mindmapId) => {
    requestHandler(
      () => deleteMindmap(mindmapId),
      setLoading,
      "Deleting mindmap...",
      // eslint-disable-next-line no-unused-vars
      (res) => {
        setMindmaps((prev) => prev.filter((m) => m._id !== mindmapId));
      }
    );
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        {/* Input + Button */}
        <div className="max-w-xl mx-auto flex flex-col items-center text-center pt-8">
          <div className="w-full mt-15">
            <GradientInput
              id="title"
              name="title"
              type="text"
              placeholders={[
                "Type Your Idea",
                "Type something creative",
                "Type You Topic",
                "Type Leaning Headline",
                "Paste Syllabus",
                "Paste Your Notes",
              ]}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full mt-5">
            <SlideButton
              text={loading ? "Creating..." : "Do Magic"}
              onClick={handleCreateMindmap}
              disabled={loading}
              fullWidth
              icon={<BsMagic size={25} />}
              className="w-full"
            />
          </div>

          {loading && (
            <p className="text-gray-300" role="status">
              Loading…
            </p>
          )}
        </div>

        {/* Mindmaps Grid */}
        <div className="mt-2 mb-8">
          {mindmaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mindmaps.map((mindmap) => (
                <MindmapCard
                  key={mindmap._id}
                  mindmap={mindmap}
                  onToggleVisibility={
                    mindmap.owner === session.user.id
                      ? handleUpdateMindmap
                      : null
                  }
                  onDelete={
                    mindmap.owner === session.user.id
                      ? handleDeleteMindmap
                      : null
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center">No mindmaps found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
