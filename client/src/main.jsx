import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Router>
    <App />
  </Router>
);
