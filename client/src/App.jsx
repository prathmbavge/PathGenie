// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSession } from "./lib/auth-client";
import Pattern from "./components/Pattern.jsx";

// Pages/Components
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Profile from "./Pages/Profile.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import MindMapPage from "./Pages/MindMapPage.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";

// ------------------------
// Route Guards
// ------------------------

function PrivateRoute({ children }) {
  const { data: session, isPending, error } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Session fetch error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-red-500">
            Failed to load session. Please try again.
          </p>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  if (error) {
    console.error("Session fetch error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-orange-500">
            Failed to load session. Please try again.
          </p>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.reload()}
              className=" text-white font-bold py-2 px-4 border"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { data: session } = useSession();
  const location = useLocation();

  // Determine which routes should hide the Navbar:
  //   • public pages: "/", "/login", "/register"
  //   • mindmap pages: any path starting with "/mindmap/" (dynamic)
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPath =
    publicPaths.includes(location.pathname) ||
    location.pathname.startsWith("/mindmap/");

  // Only show Navbar if user is signed in AND not on a “hidden” path
  const shouldShowNavbar = session?.user && !isPublicPath;

  return (
    <Pattern>
      <div className="min-h-screen max-w-screen">
        {shouldShowNavbar && <Navbar />}

        <div className="flex-grow">
          <Routes>
            {/* Public Routes */}
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
            <Route path="/" element={<LandingPage />} />

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
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              fontSize: "1.2rem",
              fontFamily: "Times New Roman, serif",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              color: "#fff",
              borderRadius: "0",
            },
          }}
        />
      </div>
    </Pattern>
  );
}
