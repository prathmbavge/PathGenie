import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import SlideButton from "../components/Buttons/SlideButton";
import pathgenie from "../assets/pathgeniebanner.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="fixed w-full top-0 z-50 mt-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex-shrink-0 text-white">
            <NavLink to="/">
              <img
                className="h-auto max-w-[200px] sm:max-w-[250px]"
                src={pathgenie}
                alt="PathGenie Logo"
              />
            </NavLink>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative text-gray-300 hover:text-white transition-all duration-300 group ${
                  isActive ? "text-white" : ""
                }`
              }
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-px bg-red-400 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `relative text-gray-300 hover:text-white transition-all duration-300 group ${
                  isActive ? "text-white" : ""
                }`
              }
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-px bg-red-400 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `relative text-gray-300 hover:text-white transition-all duration-300 group ${
                  isActive ? "text-white" : ""
                }`
              }
            >
              Profile
              <span className="absolute bottom-0 left-0 w-0 h-px bg-red-400 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>

            {/* Sign In/Sign Out Button */}
            {isPending ? (
              <span className="text-gray-300">Loading...</span>
            ) : session ? (
              <SlideButton
                text="Sign Out"
                onClick={handleSignOut}
                disabled={isSigningOut}
                icon={
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
                }
                style={{ width: "20vw" }}
              />
            ) : (
              <SlideButton
                text="Sign In"
                onClick={() => navigate("/login")}
                icon={
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
                }
                style={{ width: "20vw" }}
              />
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 bg-opacity-95">
            <div className="flex flex-col items-center space-y-4 py-4">
              <NavLink
                to="/"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white transition-all duration-300 ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/dashboard"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white transition-all duration-300 ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `text-gray-300 hover:text-white transition-all duration-300 ${
                    isActive ? "text-white" : ""
                  }`
                }
              >
                Profile
              </NavLink>
              {isPending ? (
                <span className="text-gray-300">Loading...</span>
              ) : session ? (
                <SlideButton
                  text="Sign Out"
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                  disabled={isSigningOut}
                  icon={
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
                  }
                  style={{ width: "20vw" }}
                />
              ) : (
                <SlideButton
                  text="Sign In"
                  onClick={() => {
                    navigate("/login");
                    toggleMenu();
                  }}
                  icon={
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
                  }
                  style={{ width: "20vw" }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;