import React from "react";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/AuthComponents/SocialSignInButtons";
import Hero from "../components/LandingPageComponents/Hero";
import Grid from "../components/LandingPageComponents/Grid";

const LandingPage = () => {
  const handleSocialError = (error) => console.error(error);

  return (
    <PageLayout>
       <main className="relative flex justify-center items-center flex-col overflow-y-auto mx-auto sm:px-10 px-5">
      <div className="mx-w-7xl w-full">
        <Hero />
        <Grid />
      </div>
      <p className="relative text-white">Made with ❤</p>

      {/* Social Sign‐In */}
      {/* <SocialSignInButtons onError={handleSocialError} /> */}
      </main>
    </PageLayout>
  );
};

export default LandingPage;
