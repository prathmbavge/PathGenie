import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useSession } from "./lib/auth-client";
import Pattern from "./components/Pattern.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Profile from "./Pages/Profile.jsx";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
// import MindMap from "./Pages/MindMap.jsx";

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { data: session, isPending, error } = useSession();
  const location = useLocation();

  // Handle loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-gray-900 dark:text-white">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Session fetch error:", error.message);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-red-500">
            Failed to load session. Please try again.
          </p>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no session, redirect to login with the intended destination
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected route
  return children;
};

// PublicRoute to prevent logged-in users from accessing login/register
const PublicRoute = ({ children }) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="shadow-lg p-8 sm:p-12 w-full max-w-md">
          <p className="text-center text-gray-900 dark:text-white">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Pattern>
      <Router>
        {/* Navbar component can be included here if needed */}
        {window.location.pathname !== "/login" &&
          window.location.pathname !== "/register" && <Navbar />}
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

          {/* Protected Routes */}
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
          {/* <Route
            path="/mindmap"
            element={
              <PrivateRoute>
                <MindMap />
              </PrivateRoute>
            }
          /> */}
        </Routes>
      </Router>
      <Toaster
      /**
       * Configures the Toaster component with custom options.
       *
       * @prop {string} position - The position of the toasts on the screen.
       * @prop {object} toastOptions - The options for the toasts.
       * @prop {number} toastOptions.duration - The duration of the toasts in milliseconds.
       * @prop {object} toastOptions.style - The style options for the toasts.
       * @prop {string} toastOptions.style.fontWeight - The font weight of the toast text.
       * @prop {string} toastOptions.style.fontSize - The font size of the toast text.
       * @prop {string} toastOptions.style.fontFamily - The font family of the toast text.
       * @return {ReactElement} The rendered Toaster component.
       */
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          fontWeight: 'bold',
          fontSize: '1.5rem',
          fontFamily: 'times new roman',
          backgroundColor: 'black',
          color: 'white',
        },
      }}
    />
    </Pattern>
  );
}

export default App;
