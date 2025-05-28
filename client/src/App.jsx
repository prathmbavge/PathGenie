// src/App.jsx
import React, { lazy, Suspense, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Pattern from "./components/Pattern.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import { useSession } from "./lib/auth-client";
import { showErrorToast } from "../utils/toastUtils";

// ------------------------
// Lazy-loaded Pages
// ------------------------
const LandingPage = lazy(() => import("./Pages/LandingPage.jsx"));
const Login = lazy(() => import("./Pages/Login.jsx"));
const Register = lazy(() => import("./Pages/Register.jsx"));
const Dashboard = lazy(() => import("./Pages/Dashboard.jsx"));
const Profile = lazy(() => import("./Pages/Profile.jsx"));
const MindMapPage = lazy(() => import("./Pages/MindMapPage.jsx"));

// ------------------------
// Route Guards
// ------------------------

// While session is being fetched, show a loader
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
        <p className="text-center text-white">Calling Genie ;)</p>
      </div>
    </div>
  );
}

// Protect private routes: if an error occurs or no session, redirect to /login
function PrivateRoute({ children }) {
  const { isPending, error, data: session } = useSession();
  const location = useLocation();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error || !session) {
    // Show error toast if there's an error
    if (error) {
      showErrorToast("Session expired or not found. Please log in.");
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Prevent signed-in users from accessing login/register pages
function PublicRoute({ children }) {
  const { data: session } = useSession();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  // List of paths where Navbar should be hidden
  const hiddenNavbarPaths = useMemo(() => ["/login", "/register"], []);

  // Check if current route starts with "/mindmap/"
  const isMindMapPath = useMemo(
    () => location.pathname.startsWith("/mindmap/"),
    [location.pathname]
  );

  // Only show Navbar when user is signed in AND not on a hidden path
  const shouldShowNavbar = useMemo(() => {
    return !hiddenNavbarPaths.includes(location.pathname) && !isMindMapPath;
  }, [location.pathname, hiddenNavbarPaths, isMindMapPath]);

  return (
    // Wrap everything under Pattern (theme/layout wrapper)
    <Pattern>
      <div className="min-h-screen max-w-screen">
        {/* Conditionally render Navbar */}
        {shouldShowNavbar && <Navbar />}

        {/* Wrap routes inside Suspense to support lazy loading */}
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/mindmap/:mindmapId"
              element={
                <PrivateRoute>
                  <MindMapPage />
                </PrivateRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "1.2rem",
              fontFamily: "Times New Roman, serif",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "#fff",
              borderRadius: "0px",
            },
          }}
        />
      </div>
    </Pattern>
  );
}
