import React from "react";
import GlowCard from "../components/Cards/GlowCard";
import SlideButton from "../components/Buttons/SlideButton";
import GradientInput from "../components/Input/GradientInput";
const Dashboard = () => {
  return (
    <div className=" mt-18 flex flex-col items-center justify-center h-screen w-screen ">
      {/* <h1 className="text-4xl font-bold text-white">Dashboard</h1> */}
      <div className="flex flex-col items-center justify-center">
        <GradientInput
          id="search"
          name="search"
          type="text"
          placeholder="Idea Title..."
          required
          style={{ width: "80vw", marginTop: "20px" }}
        />
        <SlideButton
          text="Start Magic"
          style={{ marginTop: "10px", width: "30%" }}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              className="bi bi-magic"
              viewBox="0 0 16 16"
            >
              <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707zM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1zM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707zM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0z" />
            </svg>
          }
        />
      </div>
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto">
        <GlowCard width="340px" height="340px" padding="30px">
          <h2 className="text-2xl font-semibold text-white">Your Stats</h2>
          <p className="mt-2 text-gray-300">Here are your stats...</p>
          <ul className="mt-2 space-y-2">
            <li className="text-gray-200">Stat 1: 100</li>
            <li className="text-gray-200">Stat 2: 200</li>
            <li className="text-gray-200">Stat 3: 300</li>
          </ul>
          <SlideButton
            text="Register"
            icon={
              <span aria-hidden="true">
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
              </span>
            }
            style={{ width: "75%", marginTop: "20px" }}
          />
        </GlowCard>
        <GlowCard width="340px" height="340px" padding="30px">
          <h2 className="text-2xl font-semibold text-white">Your Stats</h2>
          <p className="mt-2 text-gray-300">Here are your stats...</p>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-200">Stat 1: 100</li>
            <li className="text-gray-200">Stat 2: 200</li>
            <li className="text-gray-200">Stat 3: 300</li>
          </ul>
          <SlideButton
            text="Register"
            icon={
              <span aria-hidden="true">
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
              </span>
            }
            style={{ width: "75%", marginTop: "20px" }}
          />
        </GlowCard>
        <GlowCard width="340px" height="340px" padding="30px">
          <h2 className="text-2xl font-semibold text-white">Your Stats</h2>
          <p className="mt-2 text-gray-300">Here are your stats...</p>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-200">Stat 1: 100</li>
            <li className="text-gray-200">Stat 2: 200</li>
            <li className="text-gray-200">Stat 3: 300</li>
          </ul>
          <SlideButton
            text="Register"
            icon={
              <span aria-hidden="true">
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
              </span>
            }
            style={{ width: "75%", marginTop: "20px" }}
          />
        </GlowCard>
        <GlowCard width="340px" height="340px" padding="30px">
          <h2 className="text-2xl font-semibold text-white">Your Stats</h2>
          <p className="mt-2 text-gray-300">Here are your stats...</p>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-200">Stat 1: 100</li>
            <li className="text-gray-200">Stat 2: 200</li>
            <li className="text-gray-200">Stat 3: 300</li>
          </ul>
          <SlideButton
            text="Register"
            icon={
              <span aria-hidden="true">
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
              </span>
            }
            style={{ width: "75%", marginTop: "20px" }}
          />
        </GlowCard>
        <GlowCard width="340px" height="340px" padding="30px">
          <h2 className="text-2xl font-semibold text-white">Your Stats</h2>
          <p className="mt-2 text-gray-300">Here are your stats...</p>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-200">Stat 1: 100</li>
            <li className="text-gray-200">Stat 2: 200</li>
            <li className="text-gray-200">Stat 3: 300</li>
          </ul>
          <SlideButton
            text="Register"
            icon={
              <span aria-hidden="true">
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
              </span>
            }
            style={{ width: "75%", marginTop: "20px" }}
          />
        </GlowCard>
        <GlowCard width="340px" height="340px" padding="30px">
          <h2 className="text-2xl font-semibold text-white">Your Stats</h2>
          <p className="mt-2 text-gray-300">Here are your stats...</p>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-200">Stat 1: 100</li>
            <li className="text-gray-200">Stat 2: 200</li>
            <li className="text-gray-200">Stat 3: 300</li>
          </ul>
          <SlideButton
            text="Register"
            icon={
              <span aria-hidden="true">
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
              </span>
            }
            style={{ width: "75%", marginTop: "20px" }}
          />
        </GlowCard>
      </div>
    </div>
  );
};
export default Dashboard;
