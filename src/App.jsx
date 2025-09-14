import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/home.css";
import Navbar from "./components/navbar";
import "./styles/navbar.css";

import Home from "./pages/home"; // You may want to rename this file to About.jsx
// import Projects from "./pages/projects";
// import Experience from "./pages/experience";

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Home />} /> {/* Changed from /home to /about */}
        </Routes>
      </Router>
    </>
  );
}
