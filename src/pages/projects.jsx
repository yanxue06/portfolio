import React, { useState, useEffect } from "react";
import "../styles/parallax.scss"; // Ensure your build system compiles SCSS
import "../styles/projects.css";
import Projects from "../components/projects";
import Contacts from '../components/contacts';

export default function Parallax() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY); // Track the global scroll position
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="p3"> 
      <div className="heading">PROJECTS</div>
     <div className="parallax">
        

        {/* Parallax layers with images */}
        <div
          className="parallax__layer parallax__layer__0"
          style={{
            transform: `translateY(${scrollY * 1.5}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_0.png?raw=true"
            alt="Layer 0"
          />
        </div>
        <div
          className="parallax__layer parallax__layer__1"
          style={{
            transform: `translateY(${scrollY * 1.2}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_1.png?raw=true"
            alt="Layer 1"
          />
        </div>
        <div
          className="parallax__layer parallax__layer__2"
          style={{
            transform: `translateY(${scrollY * 0.9}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_2.png?raw=true"
            alt="Layer 2"
          />
        </div>
        <div
          className="parallax__layer parallax__layer__3"
          style={{
            transform: `translateY(${scrollY * 0.6}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_3.png?raw=true"
            alt="Layer 3"
          />
        </div>
        <div
          className="parallax__layer parallax__layer__4"
          style={{
            transform: `translateY(${scrollY * 0.4}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_4.png?raw=true"
            alt="Layer 4"
          />
        </div>
        <div
          className="parallax__layer parallax__layer__5"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_5.png?raw=true"
            alt="Layer 5"
          />
        </div>
        <div
          className="parallax__layer parallax__layer__6"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`, // Dramatic multiplier
          }}
        >
          <img
            src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_6.png?raw=true"
            alt="Layer 6"
          />
        </div>

        {/* Mask element to cover reflection */}
        <div className="parallax__mask">
          <Projects />
        </div>
      </div>

      <Contacts/> 
      
    </div>
  );
}