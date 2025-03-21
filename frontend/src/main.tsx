import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";

import Home from "./pages/Home";
import Voting from "./pages/Voting";
import Vote from "./pages/Vote";
import Admin from "./pages/Admin";
import Results from "./pages/Results"; // Neu hinzugefügt

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/results" element={<Results />} /> {/* Route für Ergebnisse */}
      </Routes>
      <App />
    </Router>
  </React.StrictMode>
);
