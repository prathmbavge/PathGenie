import React, { useState } from "react";
import TrueFocus from "../components/Animation/TrueFocus";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/SocialSignInButtons";
import AuthForm from "../components/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";

const Login = () => {
  const navigate = useNavigate();
  const [socialError, setSocialError] = useState("");

  return (
    <PageLayout>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
        <TrueFocus
          sentence="Login Here;)"
          blurAmount={6}
          borderColor="white"
          glowColor="red"
          manualMode={true}
          animationDuration={0.5}
        />
      </h2>
      <SocialSignInButtons onError={setSocialError} />
      {socialError && (
        <div className="text-red-500 text-sm text-center mb-4">{socialError}</div>
      )}
      <div className="text-center">
      <AuthForm isLogin />
      </div>
      <p className="mt-2 text-center text-sm text-white dark:text-white">
        Don’t have an account? <br />
        <SlideButton
          text="Register"
          icon={<ArrowIcon />}
          style={{ width: "70%", marginTop: "0.5em" }}
          onClick={() => navigate("/register")}
        />
      </p>
    </PageLayout>
  );
};

const ArrowIcon = () => (
  <svg
    className="w-6 h-6 text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 10 16"
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

export default Login;