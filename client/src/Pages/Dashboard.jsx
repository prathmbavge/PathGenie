import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientInput from "../components/Input/GradientInput";
import SlideButton from "../components/Buttons/SlideButton";
import GlowCard from "../components/Cards/GlowCard";
import { requestHandler } from "../../utils/index";
import { showSuccessToast } from "../../utils/toast";
import { createMindmap, getAllMindmaps } from "../api/mindmapApi";

const Dashboard = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState([]);
  // const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateMindmap = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    setLoading(true);
    await requestHandler(
      () => createMindmap(title),
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
          console.log("Fetched mindmaps:", res.data.mindmaps);
          setMindmaps(res.data.mindmaps);
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
    <div className="mt-20 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <GradientInput
          id="title"
          name="title"
          type="text"
          placeholder="Idea Title..."
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "80vw", marginTop: "20px", margin: "0 auto" }}
        />
        <SlideButton
          text={loading ? "Creating..." : "Start Magic"}
          onClick={handleCreateMindmap}
          disabled={loading}
          style={{ marginTop: "10px", width: "30%" }}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              className="bi bi-magic"
              viewBox="0 0 16 16"
            >
              <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707zM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1zM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707zM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0z" />
            </svg>
          }
        />
        {loading && <p className="text-white mt-4">Loading...</p>}
        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto w-full mt-10">
          {
            mindmaps && mindmaps.length > 0 ? (
              mindmaps.map((mindmap) => (
                <GlowCard
                  key={mindmap._id}
                 width="340px" height="340px" padding="30px">
                  <div
                    key={mindmap._id}
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/mindmap/${mindmap._id}`)}
                  >
                    <h2 className="text-2xl font-bold text-white">
                      {mindmap.title}
                    </h2>
                    <p className="text-gray-400 mt-2">
                      {new Date(mindmap.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 mt-2">
                      {mindmap.nodeCount} nodes
                    </p>
                    <p className="text-gray-400 mt-2">
                      {mindmap.tags}
                    </p>
                    <p className="text-gray-400 mt-2">
                      {mindmap.visibility}
                    </p>
                  </div>
                </GlowCard>
              ))
            ) : (
              <p className="text-white">No mindmaps found.</p>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;