import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/home.css";
import Navbar from "./components/navbar";
import "./styles/navbar.css";

import Home from "./pages/home";
import Gallery from "./pages/gallery";
import Projects from "./pages/projects";
import Experience from "./pages/experience";

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/experience" element={<Experience />} />
        </Routes>
      </Router>
    </>
  );
}
