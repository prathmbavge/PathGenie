import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from './PageLayout';
import SocialSignInButtons from '../components/SocialSignInButtons';
import SlideButton from '../components/Buttons/SlideButton';
import ArrowIcon from '../components/Icons/ArrowIcon';
import LoginIcon from '../components/Icons/LoginIcon';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleSocialError = (error) => console.error(error);

  return (
    <PageLayout maxWidth="max-w-md">
      {/* Heading */}
      <h2 className="text-3xl font-bold  mb-4">
        Welcome to Path Genie
      </h2>

      {/* Subtitle */}
      <p className=" mb-8">
        Your personal productivity companion
      </p>

      {/* Primary Actions */}
      <div className="flex gap-4 mb-8">
        {/* We wrap each button in a flex‐1 container so they share available space */}
        <div className="flex-1 ">
          <SlideButton
            text="Login"
            icon={<LoginIcon />}
            onClick={handleLogin}
            fullWidth={true}
          />
        </div>
        <div className="flex-1">
          <SlideButton
            text="Register"
            icon={<ArrowIcon />}
            onClick={handleRegister}
            fullWidth={true}
          />
        </div>
      </div>

      {/* Social Sign‐In */}
      <SocialSignInButtons onError={handleSocialError} />
    </PageLayout>
  );
};


export default LandingPage;
