import React, { useEffect } from "react";
import "../styles/home.css";
import "../styles/timeline.css";
import TimeLine from "../components/timeline";
import Intro from "../components/intro";
import About from "../components/about";
import Arrows from "../components/arrow";
import Projects from "../components/projects"
import Contacts from "../components/contacts";
// import TravelGlobe from "../components/TravelGlobe";

export default function App() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <div className="max-w-[1000px] mx-auto px-4">
        <Arrows />

        <Intro />

        <section className="p2">
          <div className="col">
            <div id="about">
              <About />
            </div>

            {/* <div id="travel-globe">
              <TravelGlobe />
            </div> */}
            
            <div id="experience">
              <TimeLine />
            </div>

            <div id="projects">
              <Projects />
            </div>

          </div>
        </section>

        {/* <Projects /> */}

        <Contacts />
      </div>
    </>
  );
}
