import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";

import Home from "./pages/Home";
import Voting from "./pages/Voting";
import Admin from "./pages/Admin";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <App />
    </Router>
  </React.StrictMode>
);
