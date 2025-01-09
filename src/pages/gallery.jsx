// about.jsx
import React from "react";
import Typewriter from '../components/typewriter'
import '../gallery.css'
import g1 from '../images/g1.png'
import g2 from '../images/g2.png'
import g3 from '../images/g3.png'
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function About() {
  return (
    <div className="p3">
      <div className="photos">
        <Typewriter text="Here are some of my favourite photos that highlight my life" speed={50} highlightWord='my life'/>
      </div>
      <div className="gallery"> 
        <img src={g1} alt="hi"/> 
        <img src={g2} alt="hi2"/> 
        <img src={g3} alt="hi3"/> 
      </div> 
    </div>
    //create a 2 by 2 grid with fade in and fade out... each photo maybe can click in with a short description 
  );
}
