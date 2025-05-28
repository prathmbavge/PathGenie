import React from "react";
import PageLayout from "./PageLayout";
import Hero from "../components/LandingPageComponents/Hero";
import Grid from "../components/LandingPageComponents/Grid";

/**
 * The LandingPage component renders the landing page of the website.
 *
 * @returns {React.ReactElement} The LandingPage component.
 */
const LandingPage = () => {
  return (
    <PageLayout>
       <main className="relative flex justify-center items-center flex-col overflow-y-auto mx-auto sm:px-10 px-5">
      <div className="mx-w-7xl w-full">
        <Hero />
        <Grid />
      </div>
      <p className="relative text-white mb-5">Made with ❤ for Perplexity's Hackthon 🧑🏻‍💻</p>
      </main>
    </PageLayout>
  );
};

export default LandingPage;
