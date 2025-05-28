// src/components/SocialSignInButtons.jsx
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import SlideButton from "../Buttons/SlideButton";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { userSocialSignOn } from "../../api/authApi";
/**
 * SocialSignInButtons
 *
 * A component that renders two buttons for signing in with Google and GitHub.
 *
 * @param {Function} setError - A function to set error messages.
 *
 * @returns {React.ReactElement} - A React component that renders social sign-in buttons.
 */
const SocialSignInButtons = ({ setError }) => {
  const handleSocialSignIn = useCallback(
    async (provider) => {
      await userSocialSignOn(provider, setError);
    },
    [setError]
  );

  return (
    <div className="flex justify-center space-x-4  flex-wrap md:space-x-10">
      <SlideButton
        text="Google"
        icon={<FaGoogle />}
        onClick={() => handleSocialSignIn("google")}
        fullWidth={true}
        style={{ width: "100vw", maxWidth: "200px" }}
      />
      <SlideButton
        text="GitHub"
        icon={<FaGithub />}
        onClick={() => handleSocialSignIn("github")}
        fullWidth={true}
        style={{ width: "100vw", maxWidth: "200px" }}
      />
    </div>
  );
};

SocialSignInButtons.propTypes = {
  onError: PropTypes.func,
};

SocialSignInButtons.defaultProps = {
  onError: () => {},
};

export default SocialSignInButtons;
