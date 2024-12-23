import React from 'react'; 
import './App.css'; 
import './App.scss'; 
import Typewriter from './components/typewriter'
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";


export default function Gallery() {
  return (
    <> 
    <div class="animation-wrapper">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
    </div>

    <div className="container"> 
      <div className="logo">  
          <FaLinkedin/> 
          <FaGithub/> 
      </div> 

      <section className="text-box">
        <div className="intro"> 
          <div className="top-section"> 
            <h1> ECE Student at the University of Waterloo </h1>
          </div> 
          <div className="bottom-section"> 
            <Typewriter text="Hi, I'm Yan" speed={300} />
          </div>
        </div> 
      </section>
    </div> 
    </>
  );
}
