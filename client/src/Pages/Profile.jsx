import React, { useEffect, useState } from "react";
import { useSession, signOut } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/userApi";
import { requestHandler } from "../../utils/index";
import { showSuccessToast } from "../../utils/toast";
import SlideButton from "../components/Buttons/SlideButton";

export function Profile() {
  // eslint-disable-next-line no-unused-vars
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending, error, refetch } = useSession();

  const handleRefetch = () => {
    refetch();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  const fetchProfile = async () => {
    if (session) {
      setIsProfileLoading(true);
      setProfileError("");
      await requestHandler(
        async () => await getUserProfile(),
        null,
        (res) => {
          setProfile(res.data);
        //   console.log(res.data);
          setBio(res.data.profile.bio || "");
          showSuccessToast(res.message);
        }
      );
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    await requestHandler(
      async () => await updateUserProfile({ bio }),
      null,
      (res) => {
        setProfile(res.data);
        showSuccessToast("Profile updated successfully.");
      }
    );
    setIsUpdating(false);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center dark:text-white">Loading...</p>
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
            <SlideButton text="Try Again" onClick={handleRefetch} />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center dark:text-white">
            No session found. Please log in.
          </p>
          <div className="mt-4 text-center">
            <SlideButton text="Login" onClick={() => navigate("/login")} />
          </div>
        </div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg p-8 sm:p-12 w-full max-w-md rounded-lg">
        <h2 className="text-3xl font-bold dark:text-white mb-6 text-center">
          Your Profile
        </h2>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={user?.image || "https://via.placeholder.com/96"}
              className="w-24 h-24 rounded-full mb-4"
              alt="Profile"
            />
            <div className="text-center space-y-2">
              <p className="dark:text-gray-300">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="dark:text-gray-300">
                <strong>Username:</strong> {user.name}
              </p>
            </div>
          </div>
          {isProfileLoading ? (
            <p className="text-center text-gray-500">Loading profile data...</p>
          ) : profileError ? (
            <p className="text-center text-red-500">{profileError}</p>
          ) : (
            <div className="mt-4">
              <label className="block text-sm font-medium dark:text-white">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 p-2 w-full border rounded  dark:text-white"
                placeholder="Write your bio here..."
              />
              <div className="mt-2 text-center">
                <SlideButton
                  text="Save"
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  isLoading={isUpdating}
                  fullWidth={true}

                />
              </div>
            </div>
          )}
          <div className="flex justify-center space-x-4 mt-6">
            <SlideButton text="Refetch" onClick={handleRefetch} fullWidth={true} />
            <SlideButton text="Logout" onClick={handleLogout} fullWidth={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;