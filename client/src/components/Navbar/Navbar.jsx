// src/components/Navbar/Navbar.jsx
import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import SlideButton from "../../components/Buttons/SlideButton";
import pathgenie from "../../assets/pathgeniebanner.png";
import { useNavbarVisibility } from "../../hooks/useNavbarVisibility";
import { navLinks, linkBaseClasses, activeLinkClasses } from "./constants";

const Navbar = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isNavbarVisible = useNavbarVisibility(2000, 50);

  // Toggle mobile menu open/close
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error.message);
    } finally {
      setIsSigningOut(false);
    }
  }, [navigate]);

  // Button props for "Sign In" / "Sign Out"
  const AuthButton = () => {
    if (isPending) {
      return <span className="text-gray-300">Loading...</span>;
    }

    if (session?.user) {
      return (
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
          fullWidth={true}
          style={{ width: "25rem" }}
        />
      );
    }

    return (
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
    );
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 mt-1 transition-transform duration-300 ${
        isNavbarVisible ? "transform translate-y-0" : "transform -translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex-shrink-0 text-white">
            <NavLink to="/">
              <img
                className="h-auto max-w-[150px] sm:max-w-[250px]"
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
              aria-expanded={isMenuOpen}
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
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${linkBaseClasses} ${isActive ? activeLinkClasses : ""}`
                }
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-red-400 transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            ))}

            {/* Sign In / Sign Out */}
            <AuthButton />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden  bg-blur-50 backdrop-blur-md rounded-lg shadow-lg p-4">
            <div className="flex flex-col items-center space-y-4 py-4">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={toggleMenu}
                  className={({ isActive }) =>
                    `text-gray-300 hover:text-white transition-all duration-300 ${
                      isActive ? activeLinkClasses : ""
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              {isPending ? (
                <span className="text-gray-300">Loading...</span>
              ) : session?.user ? (
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
                  fullWidth={true}
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
                  fullWidth={true}
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
