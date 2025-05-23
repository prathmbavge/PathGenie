// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientInput from "../components/Input/GradientInput";
import SlideButton from "../components/Buttons/SlideButton";
import GlowCard from "../components/Cards/GlowCard";
import { requestHandler } from "../../utils/index";
import { showSuccessToast } from "../../utils/toastUtils";
import { createMindmap, getAllMindmaps } from "../api/mindmapApi";

const MagicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1rem"
    height="1rem"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707zM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1zM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707zM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0z" />
  </svg>
);

const Dashboard = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState([]);
  const navigate = useNavigate();

  const handleCreateMindmap = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    setLoading(true);
    await requestHandler(
      () => createMindmap(title.trim()),
      setLoading,
      (res) => {
        const mindmapId = res.data.mindmap._id;
        showSuccessToast("Mindmap created successfully");
        navigate(`/mindmap/${mindmapId}`);
      },
      (error) => {
        console.error("Error creating mindmap:", error);
        alert("Failed to create mindmap.");
      }
    );
  };

  useEffect(() => {
    const fetchMindmaps = async () => {
      setLoading(true);
      await requestHandler(
        () => getAllMindmaps(),
        setLoading,
        (res) => {
          setMindmaps(res.data.mindmaps || []);
          showSuccessToast("Fetched mindmaps successfully");
        },
        (error) => {
          console.error("Error fetching mindmaps:", error);
          alert("Failed to fetch mindmaps.");
        }
      );
    };

    fetchMindmaps();
  }, []);

  return (
    // 1. This wrapper takes full viewport height and keeps the background fixed below it.
    //    PageLayout (or your global CSS) should have `background-attachment: fixed` on body or a wrapper.
    <div className="h-screen flex flex-col">
      {/* 2. This inner wrapper is scrollable when content overflows vertically. */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        {/* Input + Button Container */}
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
              fullWidth={true}
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
                <GlowCard
                  key={mindmap._id}
                  width="100%"
                  maxWidth="340px"
                  height="auto"
                  padding="24px"
                  className="mx-auto"
                >
                  <div
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/mindmap/${mindmap._id}`)}
                  >
                    <h2 className="text-2xl font-bold text-white text-center">
                      {mindmap.title}
                    </h2>
                    <p className="text-gray-400 mt-2">
                      {new Date(mindmap.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {mindmap.nodeCount} node
                      {mindmap.nodeCount === 1 ? "" : "s"}
                    </p>
                    {mindmap.tags && (
                      <p className="text-gray-400 mt-1 break-words text-center">
                        {mindmap.tags.join(", ")}
                      </p>
                    )}
                    <p className="text-gray-400 mt-1 capitalize">
                      {mindmap.visibility}
                    </p>
                  </div>
                </GlowCard>
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
