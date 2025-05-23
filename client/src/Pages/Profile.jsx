import React, { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/userApi";
import { requestHandler } from "../../utils/index";
import { showSuccessToast } from "../../utils/toastUtils";
import SlideButton from "../components/Buttons/SlideButton";

const Profile = () => {
  // eslint-disable-next-line no-unused-vars
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending, error, refetch } = useSession();

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error(
        "Logout error:",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    if (!session) return;

    setIsProfileLoading(true);
    setProfileError("");
    await requestHandler(
      async () => await getUserProfile(),
      null,
      (res) => {
        // console.log("Profile data:", res.data.profile);
        setProfile(res.data.profile);
        setBio(res.data?.profile.bio || "");
        showSuccessToast(res.message);
      },
      (err) => {
        setProfileError(err.message);
      }
    );
    setIsProfileLoading(false);
  }, [session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = useCallback(async () => {
    if (!bio.trim()) {
      setProfileError("Bio cannot be empty");
      return;
    }

    setIsUpdating(true);
    await requestHandler(
      async () => await updateUserProfile({ bio: bio.trim() }),
      null,
      (res) => {
        // console.log("Profile updated:", res.data.profile);
        // refetch();
        showSuccessToast(res.message);
      },
      (err) => {
        setProfileError(err.message);
      }
    );
    setIsUpdating(false);
  }, [bio]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center  ">
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
      <div className="min-h-screen flex items-center justify-center ">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md ">
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
      <div className="min-h-screen flex items-center justify-center ">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md ">
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
    <div className="min-h-screen flex items-center justify-center ">
      <div className="shadow-lg p-8 sm:p-12 w-full max-w-md ">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Your Profile
        </h2>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={user.image || "https://via.placeholder.com/96"}
              className="w-24 h-24 rounded-full mb-4 object-cover"
              alt="Profile"
            />
            <div className="text-center space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Username:</strong> {user.name}
              </p>
            </div>
          </div>
          {isProfileLoading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Loading profile data...
            </p>
          ) : profileError ? (
            <p className="text-center text-red-500">{profileError}</p>
          ) : (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 p-2 w-full border focus:ring-2 focus:ring-blue-500  dark:text-white bg-blured-50 shadow-sm"
                placeholder="Write your bio here..."
                rows={4}
                maxLength={500}
              />
              <div className="mt-2 text-center">
                <SlideButton
                  text="Save"
                  onClick={handleUpdateProfile}
                  disabled={isUpdating || !bio.trim()}
                  isLoading={isUpdating}
                  fullWidth
                />
              </div>
            </div>
          )}
          <div className="flex justify-center space-x-4 mt-6">
            <SlideButton text="Refetch" onClick={handleRefetch} fullWidth />
            <SlideButton text="Logout" onClick={handleLogout} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Profile);
