import React, { useState } from "react";
import TrueFocus from "../components/Animation/TrueFocus";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/SocialSignInButtons";
import AuthForm from "../components/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";

const Register = () => {
  const navigate = useNavigate();
  const [socialError, setSocialError] = useState("");

  return (
    <PageLayout>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
        <TrueFocus
          sentence="Register Here!"
          blurAmount={6}
          borderColor="white"
          glowColor="red"
          manualMode
          animationDuration={0.5}
        />
      </h2>
      <SocialSignInButtons onError={setSocialError} />
      {socialError && (
        <div className="text-red-500 text-sm text-center mb-4">{socialError}</div>
      )}
      <AuthForm />
      <p className="mt-2 text-center text-sm text-white dark:text-white">
        Already have an account? <br />
        <SlideButton
          text="Login"
          icon={<LoginIcon />}
          style={{ width: "70%", marginTop: "0.5em" }}
          onClick={() => navigate("/login")}
        />
      </p>
    </PageLayout>
  );
};

const LoginIcon = () => (
  <svg
    className="w-6 h-6 text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 18 16"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
    />
  </svg>
);

export default Register;