// src/pages/Login.jsx
import React, { useState } from "react";
import TrueFocus from "../components/Animation/TrueFocus";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/AuthComponents/SocialSignInButtons";
import AuthForm from "../components/AuthComponents/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";
import { FaUserPlus } from "react-icons/fa";

/**
 * A page for logging in to the app.
 *
 * This page renders a {@link TrueFocus} heading, a {@link SocialSignInButtons} component for logging in with
 * Google or GitHub, an {@link AuthForm} component for logging in with an email and password, and a link to the
 * register page.
 *
 * @returns {JSX.Element} The Login page component.
 */
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
          borderColor="orange"
          glowColor="red"
          animationDuration={0.5}
        />
      </h2>

      {/* Social Sign-In Buttons */}
      <SocialSignInButtons setError={setSocialError} />
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
              icon={<FaUserPlus />}
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
