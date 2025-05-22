// src/components/SocialSignInButtons.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import SlideButton from '../components/Buttons/SlideButton';
import { signIn } from '../lib/auth-client';
import GoogleIcon from '../components/Icons/GoogleIcon';
import GitHubIcon from '../components/Icons/GitHubIcon';
import constants from '../../constants';

const SocialSignInButtons = ({ onError }) => {
  const handleSocialSignIn = useCallback(
    async (provider) => {
      try {
        await signIn.social({
          provider,
          callbackURL: `${constants.mode === 'production' ? '' : `${constants.clientUrl}`}/dashboard`,
          newUserCallbackURL: `${constants.mode === 'production' ? '' : `${constants.clientUrl}`}/profile`,
        });
        console.log(`Successfully signed in with ${provider}`);
      } catch (error) {
        console.error(`${provider} sign-in error:`, error);
        onError(`Failed to sign in with ${provider}. Please try again.`);
      }
    },
    [onError]
  );

  return (
    <div className="flex justify-center space-x-4 mb-6 pb-4 border-b border-gray-300 flex-wrap md:space-x-10">
      <SlideButton
        text="Google"
        icon={<GoogleIcon />}
        onClick={() => handleSocialSignIn('google')}
        fullWidth={true}
        className="md:w-1/2"
      />
      <SlideButton
        text="GitHub"
        icon={<GitHubIcon />}
        onClick={() => handleSocialSignIn('github')}
        fullWidth={true}
        className="md:w-1/2"
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
