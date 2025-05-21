// src/components/Navbar/constants.js
export const linkBaseClasses =
  "relative text-gray-300 hover:text-white transition-all duration-300 group";

export const activeLinkClasses = "text-white";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
];

// If you ever want more links (e.g. /settings, /about), just append to this array.
