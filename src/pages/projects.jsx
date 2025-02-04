// Parallax.jsx
import React from "react";
import "../parallax.scss"; // Ensure your build system compiles SCSS
import "../projects.css"; 

export default function Parallax() {
  return (
    <div className="parallax">

      <div className="heading"> 
        PROJECTS 
      </div> 

      <div className="parallax__layer parallax__layer__0">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_0.png?raw=true"
          alt="Layer 0"
        />
      </div>
      <div className="parallax__layer parallax__layer__1">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_1.png?raw=true"
          alt="Layer 1"
        />
      </div>
      <div className="parallax__layer parallax__layer__2">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_2.png?raw=true"
          alt="Layer 2"
        />
      </div>
      <div className="parallax__layer parallax__layer__3">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_3.png?raw=true"
          alt="Layer 3"
        />
      </div>
      <div className="parallax__layer parallax__layer__4">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_4.png?raw=true"
          alt="Layer 4"
        />
      </div>
      <div className="parallax__layer parallax__layer__5">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_5.png?raw=true"
          alt="Layer 5"
        />
      </div>
      <div className="parallax__layer parallax__layer__6">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_6.png?raw=true"
          alt="Layer 6"
        />
      </div>
      {/* Cover element: This will mask any content that appears below the parallax */}
      {/* This new div acts as a solid “mask” to cover reflection */}
      <div className="parallax__mask"></div>

      {/* The cover is still there for the remainder of the page */}
      <div className="parallax__cover"></div>
    </div>
  );
}
