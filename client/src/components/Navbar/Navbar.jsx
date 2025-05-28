// src/components/Navbar/Navbar.jsx
import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import SlideButton from "../../components/Buttons/SlideButton";
import pathgenie from "../../assets/pathgeniebanner.png";
import { useNavbarVisibility } from "../../hooks/useNavbarVisibility";
import { navLinks, linkBaseClasses, activeLinkClasses } from "./constants";
import { GrLogin, GrLogout } from "react-icons/gr";

/**
 * A navigation bar component that displays the application's logo,
 * navigation links and a button to sign in or sign out. When the
 * user is signed in, the navigation links are displayed. When the
 * user is signed out, only the sign in button is displayed.
 *
 * The navigation bar is responsive and will hide or show the
 * navigation links based on the screen size. On smaller screens,
 * the navigation links are hidden and a hamburger menu is displayed
 * which can be used to toggle the visibility of the navigation links.
 *
 * The component uses the `useSession` hook from `better-auth` to
 * determine whether the user is signed in or not. When the user is
 * signed in, the component will display the navigation links. When
 * the user is signed out, the component will display a sign in button.
 *
 * The component also uses the `useNavbarVisibility` hook to
 * determine whether the navigation bar should be visible or not.
 * The hook takes two arguments, the `breakpoint` and the `distance`.
 * The `breakpoint` is the screen size at which the navigation bar
 * should be hidden or shown. The `distance` is the distance from the
 * top of the screen to the navigation bar. When the user scrolls
 * past the `distance`, the navigation bar will be hidden. When the
 * user scrolls back up to the `distance`, the navigation bar will
 * be shown.
 *
 * @returns {React.ReactElement} The navigation bar component.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isNavbarVisible = useNavbarVisibility(800, 43);

  // Toggle mobile menu open/close
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate("/");
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
          icon={<GrLogout className="w-5 h-5 text-orange" />}
          style={{ width: "25rem" }}
        />
      );
    }

    return (
      <SlideButton
        text="Sign In"
        onClick={() => navigate("/login")}
        icon={<GrLogin className="w-5 h-5 text-gray-800 dark:text-white" />}
        fullWidth={true}
        style={{ width: "25rem" }}
      />
    );
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-transform duration-300 ${
        isNavbarVisible
          ? "transform translate-y-0"
          : "transform -translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 w-full">
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
          {session?.user && (
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
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
              ))}
            </div>
          )}
          {!isMenuOpen &&
          <AuthButton />
          }
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && session?.user && (
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
              ) : (
                <AuthButton />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
