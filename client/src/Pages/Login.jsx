// src/pages/Login.jsx
import React, { useState } from "react";
import TrueFocus from "../components/Animation/TrueFocus";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/AuthComponents/SocialSignInButtons";
import AuthForm from "../components/AuthComponents/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1rem"
    height="1rem"
    fill="none"
    viewBox="0 0 10 16"
    aria-hidden="true"
    focusable="false"
    className="text-gray-900 dark:text-white"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m2.707 14.293 5.586-5.586a1 1 0 0 0 0-1.414L2.707 1.707A1 1 0 0 0 1 2.414v11.172a1 1 0 0 0 1.707.707Z"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [socialError, setSocialError] = useState("");

  return (
    <PageLayout>
      {/* Page Heading */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
        <TrueFocus
          sentence="Login Here"
          blurAmount={6}
          borderColor="white"
          glowColor="red"
          animationDuration={0.5}
        />
      </h2>

      {/* Social Sign-In Buttons */}
      <SocialSignInButtons onError={setSocialError} />
      {socialError && (
        <div className="text-red-500 text-sm text-center mb-4">
          {socialError}
        </div>
      )}

      {/* Email/Password Login Form */}
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-md">
          <AuthForm isLogin />
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
        Don’t have an account?
        <div className="mt-2 flex justify-center">
          <div className="w-7/12 max-w-xs">
            <SlideButton
              text="Register"
              icon={<ArrowIcon />}
              onClick={() => navigate("/register")}
              fullWidth={true}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
