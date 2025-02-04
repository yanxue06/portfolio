// about.jsx
import React from "react";
import Typewriter from '../components/typewriter'
import '../gallery.css'

// import g1 from '../images/g1.png'
// import g2 from '../images/g2.png'
// import g3 from '../images/g3.png'
// import g4 from '../images/g4.png'
// import g5 from '../images/g5.png'
// import g6 from '../images/g6.png'
// import g7 from '../images/g7.png'
// import g8 from '../images/g8.png'
// import g9 from '../images/g9.png'
// import g10 from '../images/g10.png'
// import g11 from '../images/g11.png'
// import g12 from '../images/g12.png'



export default function Gallery() {
  return (
    <div className="p3">
      <div className="photos">
        <Typewriter text="Here are some of my favourite photos that highlight my life" speed={50} highlightWord='my life'/>
      </div>
      <div className="gallery"> 
        {/* <img src={g1} alt="1"/> 
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
        <img src={g12} alt="12"/>  */}
      </div> 
    </div>
    //create a 2 by 2 grid with fade in and fade out... each photo maybe can click in with a short description 
  );
}
