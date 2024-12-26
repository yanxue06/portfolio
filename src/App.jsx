import React from 'react'; 
import './App.css'; 
import './App.scss'; 
import Typewriter from './components/typewriter'
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import HongMall from './images/HongMall.png'; 
import MidnightSun from './images/MidnightSun.jpeg'; 

export default function Gallery() {
  return (
    <> 
    <section className="p1" >
      <div class="animation-wrapper">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
      </div>

      <div className="logo">
        <div className="linkedin"> 
          <a
            href="https://linkedin.com/in/yanxue-ce/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin size={50}/>
          </a>
        </div> 

        <div className="github"> 
          <a
            href="https://github.com/yanxue06"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={50}/>
          </a>
        </div>
      </div>


      <div className="intro"> 
        <div className="top-section"> 
          <h1> ECE Student at the University of Waterloo </h1>
        </div> 
        <div className="bottom-section"> 
          <Typewriter text="Hi, I'm Yan" speed={300} />
        </div>
      </div> 
    </section>
    
    <section className="p2"> 
      <div className="title"> 
        <h1> About Me </h1> 
      </div> 
      <div className="text"> 
        <p> hey... as you've already seen, my name is Yan. I am a first year computer engineering student at The University of Waterloo. My primary interest at the moment is AI, specifically NLP. My values include family, friends, and Christianity. Some of my hobbies include guitar, ultimate frisbee, and brawl stars </p>  
      </div>  

      <div className="title"> 
        <h1> Experience </h1> 
      </div>
      <div className="text"> 
        <p> Automation Developer - HongMall </p>
        <div className="experience-images"> 
          <img src={HongMall} alt="HongMall"/>
        </div> 
        <p> Firmware Member - Midnight Sun </p>
        <div className="experience-images"> 
          <img src={MidnightSun} alt="MidnightSun"/>
        </div> 
        <p> Software Developer - Skynet Security System </p>  
        
      </div> 

      <div className="title"> 
        <h1> Projects </h1> 
      </div>

      <div className="text"> 
        <p> Trackify </p> 
        <p> CSV Data Normalizer </p> 
        <p> LinkCom - STM32...</p>
      </div>

      <div className="title"> 
        <h1> Tech Stack </h1> 
      </div>
      
    </section>

    </>
  );
}
