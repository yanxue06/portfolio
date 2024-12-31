import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'; 
import Navbar from './components/navbar';
import './navbar.css';

import Home from './pages/home'; 
import About from "./pages/about";
import Projects from "./pages/projects";
import Blog from "./pages/blog";
import Gallery from "./pages/gallery";


export default function App() {
  return (
    <>  
      <Router> 
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />             {/* / goes to Home */}
          <Route path="/about" element={<About />} />       {/* /about goes to About */}
          <Route path="/projects" element={<Projects />} /> {/* /projects goes to Projects */}
          <Route path="/blog" element={<Blog />} />         {/* /blog goes to Blog */}
          <Route path="/gallery" element={<Gallery />} />   {/* /gallery goes to Gallery */}
        </Routes>
      </Router>
    </>
  );
}
