import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GradientInput from "../components/Input/GradientInput";
import MagicIcon from "../components/Icons/MagicIcon";
import MindmapCard from "../components/MindmapCard";
import SlideButton from "../components/Buttons/SlideButton";

import { requestHandler } from "../../utils/index";
import { showSuccessToast } from "../../utils/toastUtils";
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
  const navigate = useNavigate();

  // Create a new mindmap
  const handleCreateMindmap = useCallback(async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    setLoading(true);

    try {
      await requestHandler(
        async () => createMindmap(title.trim()),
        setLoading,
        (res) => {
          const newMindmap = res.data.mindmap;
          setMindmaps((prev) => [...prev, newMindmap]);
          showSuccessToast(res.message || "Mindmap created successfully");
          navigate(`/mindmap/${newMindmap._id}`, {
            state: { mindmap: newMindmap },
          });
        }
      );
    } catch (error) {
      console.error("Error creating mindmap:", error);
      alert("Failed to create mindmap.");
    } finally {
      setLoading(false);
    }
  }, [navigate, title]);

  // Fetch all mindmaps on mount
  useEffect(() => {
    const fetchMindmaps = async () => {
      setLoading(true);

      try {
        await requestHandler(
          async () => getAllMindmaps(),
          setLoading,
          (res) => {
            const fetchedMindmaps = res.data.mindmaps;
            // console.log("Fetched mindmaps:", fetchedMindmaps);
            setMindmaps(fetchedMindmaps);
            showSuccessToast(res.message || "Mindmaps fetched successfully");
          }
        );
      } catch (error) {
        console.error("Error fetching mindmaps:", error);
        alert("Failed to fetch mindmaps.");
      } finally {
        setLoading(false);
      }
    };

    fetchMindmaps();
  }, []);

  // Update a mindmap (e.g., visibility toggle)
  const handleUpdateMindmap = useCallback(async (mindmapId, updates) => {
    setLoading(true);
    try {
      await requestHandler(
        async () => updateMindmap(mindmapId, updates),
        setLoading,
        (res) => {
          const updatedMindmap = res.data.mindmap;
          setMindmaps((prev) =>
            prev.map((m) => (m._id === updatedMindmap._id ? updatedMindmap : m))
          );
          showSuccessToast(res.message || "Mindmap updated !");
        }
      );
    } catch (error) {
      console.error("Error updating mindmap:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteMindmap = useCallback(async (mindmapId) => {
  setLoading(true);
  try {
    await requestHandler(
      async () => deleteMindmap(mindmapId),
      setLoading,
      (res) => {
        setMindmaps((prev) => prev.filter((m) => m._id !== mindmapId));
        showSuccessToast(res.message || "Mindmap deleted successfully.");
      }
    );
  } catch (error) {
    console.error("Error deleting mindmap:", error);
    alert("Failed to delete mindmap.");
  } finally {
    setLoading(false);
  }
}, []);


  return (
    <div className="h-screen flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        {/* Input + Button */}
        <div className="max-w-xl mx-auto flex flex-col items-center text-center pt-8">
          <div className="w-full">
            <GradientInput
              id="title"
              name="title"
              type="text"
              placeholder="Idea Title..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full mt-4">
            <SlideButton
              text={loading ? "Creating..." : "Do Magic"}
              onClick={handleCreateMindmap}
              disabled={loading}
              fullWidth
              icon={<MagicIcon />}
              className="w-full"
            />
          </div>

          {loading && (
            <p className="text-gray-300 mt-4" role="status">
              Loading…
            </p>
          )}
        </div>

        {/* Mindmaps Grid */}
        <div className="mt-12 mb-8">
          {mindmaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mindmaps.map((mindmap) => (
                <MindmapCard
                  key={mindmap._id}
                  mindmap={mindmap}
                  onToggleVisibility={handleUpdateMindmap}
                  onDelete={handleDeleteMindmap}

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
