import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './Home.css'; 
import Navbar from './components/navbar';
import './navbar.css';

import Home from './pages/home'; 
import Gallery from "./pages/gallery";


export default function App() {
  return (
    <>  
      <Router> 
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />     
          <Route path="/gallery" element={<Gallery />} />         
    
        </Routes>
      </Router>
    </>
  );
}
