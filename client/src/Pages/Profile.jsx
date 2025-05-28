import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/userApi";
import { requestHandler } from "../../utils/index";
import SlideButton from "../components/Buttons/SlideButton";
import GradientInput from "../components/Input/GradientInput.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { IoMdCloudUpload } from "react-icons/io";
import { FiAlertCircle } from "react-icons/fi";
import { FaUserEdit } from "react-icons/fa";

const Profile = () => {
  // State with additional fields for personalized learning
  const [formData, setFormData] = useState({
    bio: "",
    language: "",
    background: "",
    interests: "",
    learningGoals: "",
    learningStyle: "",
    knowledgeLevel: "",
    contentTypes: "",
    timeCommitment: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending, error, refetch } = useSession();

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);
  // Skeleton loader for loading state
  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 " />
      ))}
    </div>
  );
  // Fetch profile data
  const fetchProfile = useCallback(() => {
    if (!session) return;
    setProfileError("");
    requestHandler(
      () => getUserProfile(),
      setIsProfileLoading,
      "Fetching profile...",
      (res) => {
        const profileData = res.data.profile;
        setFormData({
          bio: profileData.bio || "",
          language: profileData.language || "",
          background: profileData.background || "",
          interests: profileData.interests || "",
          learningGoals: profileData.learningGoals || "",
          learningStyle: profileData.learningStyle || "",
          knowledgeLevel: profileData.knowledgeLevel || "",
          contentTypes: profileData.contentTypes || "",
          timeCommitment: profileData.timeCommitment || "",
        });
      },
      (err) => {
        setProfileError(err.message || "Failed to fetch profile");
      }
    );
  }, [session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile data
  const handleUpdateProfile = useCallback(() => {
    requestHandler(
      () => updateUserProfile(formData),
      setIsUpdating,
      "Updating profile...",
     null,
      (err) => {
        setProfileError(err.message || "Failed to update profile");
      }
    );
  }, [formData]);

  // Toggle between edit and view mode
  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-red-500">{error.message}</p>
          <div className="mt-4 text-center">
            <SlideButton text="Try Again" onClick={handleRefetch} fullWidth />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full">
          <p className="text-center text-gray-600 dark:text-gray-300">
            No session found. Please log in.
          </p>
          <div className="mt-4 text-center">
            <SlideButton
              text="Login"
              onClick={() => navigate("/login")}
              fullWidth
            />
          </div>
        </div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen flex items-center justify-center ml-5 mr-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-screen shadow-xl"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Your Profile
        </h2>

        {/**
         * Grid container:
         * - “grid-cols-1” on small screens
         * - “md:grid-cols-3” on ≥768px (avatar + fields occupy remaining 2 columns)
         * - “lg:grid-cols-4” on ≥1024px (avatar = 1, fields = next 3)
         */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* ─── AVATAR COLUMN ─── */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <img
                src={user.image || "https://via.placeholder.com/96"}
                className="w-24 h-24 rounded-full mb-4 object-cover ring-4 ring-white ring-500/20 transition-all duration-300 group-hover:ring-8"
                alt="Profile"
              />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/**
           * ─── FIELDS COLUMN (SPANS 2 ON MD, SPANS 3 ON LG) ───
           * We nest another grid here for the actual “three-­column” arrangement of fields.
           */}
          <div className="md:col-span-2 lg:col-span-3">
            {isProfileLoading ? (
              <SkeletonLoader />
            ) : profileError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-4 mb-4 text-sm text-red-800 dark:text-red-400 "
                role="alert"
              >
                <FiAlertCircle className="flex-shrink-0 mr-3 w-5 h-5" />
                <span>{profileError}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                /**
                 * Nested grid for fields:
                 * - “grid-cols-1” on small/mobile
                 * - “sm:grid-cols-2” on ≥640px
                 * - “lg:grid-cols-3” on ≥1024px
                 */
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/** ─── BIO ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white rounded-md transition-all"
                      placeholder="Tell us about yourself…"
                      rows={4}
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap border-b-1 px-3 py-2">
                      {formData.bio || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── PREFERRED LANGUAGE ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Preferred Language
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="language"
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                      placeholders={[
                        "Preferred language for content",
                        "e.g., English, Spanish",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 border-b-1 px-3 py-2">
                      {formData.language || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── BACKGROUND ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Background
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.background}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          background: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white rounded-md transition-all"
                      placeholder="Describe your professional or educational background"
                      rows={4}
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap border-b-1 px-3 py-2">
                      {formData.background || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── INTERESTS ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Interests
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="interests"
                      value={formData.interests}
                      onChange={(e) =>
                        setFormData({ ...formData, interests: e.target.value })
                      }
                      placeholders={[
                        "Enter your interests separated by commas",
                        "e.g., machine learning, web development",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 border-b-1 px-3 py-2">
                      {formData.interests || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── LEARNING GOALS ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Learning Goals
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="learningGoals"
                      value={formData.learningGoals}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          learningGoals: e.target.value,
                        })
                      }
                      placeholders={[
                        "What do you want to achieve?",
                        "e.g., Master React, Learn Data Science",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap border-b-1 px-3 py-2">
                      {formData.learningGoals || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── LEARNING STYLE ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Preferred Learning Style
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="learningStyle"
                      value={formData.learningStyle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          learningStyle: e.target.value,
                        })
                      }
                      placeholders={[
                        "How do you prefer to learn?",
                        "e.g., Visual, Auditory, Kinesthetic",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-200 border-b-1 px-3 py-2">
                      {formData.learningStyle || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── CURRENT KNOWLEDGE LEVEL ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                    Current Knowledge Level
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="knowledgeLevel"
                      value={formData.knowledgeLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          knowledgeLevel: e.target.value,
                        })
                      }
                      placeholders={[
                        "Your self-assessed level",
                        "e.g., Beginner, Intermediate, Advanced",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-200 border-b-1 px-3 py-2">
                      {formData.knowledgeLevel || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── PREFERRED CONTENT TYPES ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 mt-6">
                    Preferred Content Types
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="contentTypes"
                      value={formData.contentTypes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contentTypes: e.target.value,
                        })
                      }
                      placeholders={[
                        "Types of resources you prefer",
                        "e.g., Videos, Articles, Interactive Tutorials",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-200 border-b-1 px-3 py-2">
                      {formData.contentTypes || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/** ─── TIME COMMITMENT ─── */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 mt-6">
                    Time Commitment
                  </label>
                  {isEditing ? (
                    <GradientInput
                      id="timeCommitment"
                      value={formData.timeCommitment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeCommitment: e.target.value,
                        })
                      }
                      placeholders={[
                        "How much time can you dedicate?",
                        "e.g., 1 hour/week, 5 hours/week",
                      ]}
                    />
                  ) : (
                    <p className="text-gray-200 border-b-1 px-3 py-2">
                      {formData.timeCommitment || "-- Not Provided --"}
                    </p>
                  )}
                </div>

                {/**
                 * ─── EDIT / SAVE BUTTON SPANNING ALL THREE FIELD COLUMNS ───
                 * On large screens, this will span all 3 columns; on smaller screens, it spans full width of its row.
                 */}
                <div className="lg:col-span-3 mt-4 text-center">
                  <SlideButton
                    text={isEditing ? "Save Changes" : "Edit Profile"}
                    icon={isEditing ? <IoMdCloudUpload /> : <FaUserEdit />}
                    onClick={isEditing ? handleUpdateProfile : handleEditToggle}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                    fullWidth
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Profile);
