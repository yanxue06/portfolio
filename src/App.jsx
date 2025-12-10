import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/home.css";
import Navbar from "./components/navbar";
import "./styles/navbar.css";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/home"));
const Updating = lazy(() => import("./pages/updating"));

export default function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#000' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Home />} />
            <Route path="/resume" element={<Updating />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}
