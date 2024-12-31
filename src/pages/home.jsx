import React from 'react'; 
import '../App.css'; 
import '../particle.scss'; 
import '../timeline.css';
import Typewriter from '../components/typewriter'
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import HongMall from '../images/HongMall.png'; 
import MidnightSun from '../images/MidnightSun.jpeg'; 
import Navbar from '../components/navbar';
import '../navbar.css';


export default function App() {
  return (
    <>  
    <section className="p1" >
      <div className="animation-wrapper">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
      </div>

      <div className="intro"> 
        <div className="top-section"> 
          <Typewriter text="Hi, I'm Yan" speed={200} />
        </div>
        <div className="bottom-section"> 
          <h1> ECE Student at the University of Waterloo </h1>
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
      </div>     

      <div className="title"> 
        <h1> About Me </h1> 
      </div> 
      <div className="text"> 
        <p> hey... as you've already seen, my name is Yan.
           I am a first year computer engineering student at The University of Waterloo. 
           My primary interest at the moment is AI, specifically NLP. 
           <br /> <br />

           Outside of school... I love: 

           <br /> <br />

           1. Guitar
           <br /> <br />
           2. Frisbee 
           <br /> <br />
           3. Brawl Stars  
           <br /> <br />
           4. Family & Friends 
           </p>  
      </div>  

      </section>


      {/* <div className="title"> 
         <h1> Experiences </h1> 
      </div>
      <div className="experiences"> 

          <div className="experience-list">

            <div className="experience-item">
              <div className="experience-logo">
                <img src={HongMall} alt="HongMall" />
              </div>
              <div className="experience-text">
                <h3>Automation Developer</h3>
                <h4> HongMall Canada</h4> 
                <ul>
                  <li>Automated shipping label generation and order flows.</li>
                  <li>Reduced manual intervention by ~40% via workflow automation.</li>
                </ul>
              </div>
            </div>

            <div className="experience-item">
              <div className="experience-logo">
                <img src={MidnightSun} alt="MidnightSun" />
              </div>
              <div className="experience-text">
                <h3>Firmware Member</h3>
                <h4> Midnight Sun </h4>
                <ul>
                  <li>Implemented an ADC driver for the ADS1115 with low-level C firmware and I2C communication.</li>
                  <li>Created a backup driver using STM32’s Backup registers for secure data storage and access control.</li>
                </ul>
              </div>
            </div>

            <div className="last-experience-item">
              <div className="experience-logo">
              </div>
              <div className="experience-text">
                <h3>Software Developer</h3>
                <h4> Skynet Security System </h4> 
                <ul>
                  <li>
                    Developed a multiprocessing Python script that performed CSV data normalization for 500+ company files.
                  </li>
                  <li>
                    Improved file processing speed by over 200% and enhanced operational workflows.
                  </li>
                  <li>
                    Performed network troubleshooting and Ethernet installation for 35+ clients.
                  </li>
                </ul>
              </div>
            </div>
          </div>  
        </div>  */}
      
      {/* <div className="title"> 
          <h1> Projects </h1> 
        </div>

        <div className="text"> 
          <p> Trackify </p> 
          <p> CSV Data Normalizer </p> 
          <p> LinkCom - STM32...</p>
        </div>

        <div className="title"> 
          <h1> Tech Stack </h1> 
      </div> */}

      

    </>
  );
}
