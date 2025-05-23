import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TrueFocus from "../components/Animation/TrueFocus";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/AuthComponents/SocialSignInButtons";
import AuthForm from "../components/AuthComponents/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";
import LoginIcon from "../components/Icons/LoginIcon";

const Register = () => {
  const navigate = useNavigate();
  const [socialError, setSocialError] = useState("");

  return (
    <PageLayout>
      {/* Page Heading */}
      <h2 className="text-3xl font-bold  mb-10 text-center">
        <TrueFocus
          sentence="Register Here"
          blurAmount={6}
          borderColor="white"
          glowColor="red"
          animationDuration={0.5}
        />
      </h2>

      {/* Social Sign‐In Buttons */}
      <SocialSignInButtons onError={setSocialError} />
      {socialError && (
        <div className="text-red-500 text-sm text-center mb-4">
          {socialError}
        </div>
      )}

      {/* Email/Password Registration Form */}
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>

      {/* “Already have an account?” Link */}
      <div className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
        Already have an account?
        <div className="mt-2 flex justify-center">
          <div className="w-7/12 max-w-xs">
            <SlideButton
              text="Login"
              icon={<LoginIcon />}
              onClick={() => navigate("/login")}
              fullWidth={true}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
