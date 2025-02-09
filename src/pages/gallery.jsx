// about.jsx
import React, { useEffect } from "react";
import Typewriter from '../components/typewriter'
import '../styles/gallery.css'

import g1 from '../images/gallery/g1.png'
import g2 from '../images/gallery/g2.png'
import g3 from '../images/gallery/g3.png'
import g4 from '../images/gallery/g4.png'
import g5 from '../images/gallery/g5.png'
import g6 from '../images/gallery/g6.png'
import g7 from '../images/gallery/g7.png'
import g8 from '../images/gallery/g8.png'
import g9 from '../images/gallery/g9.png'
import g10 from '../images/gallery/g10.png'
import g11 from '../images/gallery/g11.png'
import g12 from '../images/gallery/g12.png'
import Contacts from '../components/contacts';



export default function Gallery() {
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  return (
    <div className="p3">
      <div className="photos">
        under construction... 
      </div>
      {/* <div className="gallery"> 
        <img src={g1} alt="1"/> 
        <img src={g2} alt="2"/> 
        <img src={g3} alt="3"/> 
        <img src={g4} alt="4"/> 
        <img src={g5} alt="5"/> 
        <img src={g6} alt="6"/> 
        <img src={g7} alt="7"/> 
        <img src={g8} alt="8"/> 
        <img src={g9} alt="9"/> 
        <img src={g10} alt="10"/> 
        <img src={g11} alt="11"/> 
        <img src={g12} alt="12"/> 
      </div>  */}
      <Contacts/> 
    </div>
    
    //create a 2 by 2 grid with fade in and fade out... each photo maybe can click in with a short description 
  );
}
