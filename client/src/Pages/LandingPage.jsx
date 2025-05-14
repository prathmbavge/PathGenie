import React from "react";
import SlideButton from "../components/Buttons/SlideButton";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/SocialSignInButtons";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");
  const handleSocialError = (error) => console.error(error); // Could display to UI in future

  return (
    <PageLayout maxWidth="max-w-md">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Path Genie
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Your personal productivity companion
      </p>
      <div className="flex justify-between mb-4">
        <SlideButton text="Login" onClick={handleLogin} />
        <SlideButton text="Register" onClick={handleRegister} />
      </div>
      <SocialSignInButtons onError={handleSocialError} />
    </PageLayout>
  );
};

export default LandingPage;