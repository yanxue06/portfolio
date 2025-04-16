import React, { useEffect } from "react";
import "../styles/home.css";
import "../styles/particle.scss";
import "../styles/timeline.css";
import TimeLine from "../components/timeline";
import Intro from "../components/intro";
import About from "../components/about";
import Arrows from "../components/arrow";
import "../styles/navbar.css";

import TechStack from "../components/techstack";
import Contacts from "../components/contacts";
import ProjectShowcase from "../components/projectShowcase";

export default function App() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <div>
        <Arrows />

        <Intro />

        <section className="p2">
          <div className="col">
            <About />

            <TimeLine />

            <TechStack />

            <ProjectShowcase />
          </div>
        </section>

        {/* <Projects /> */}

        <Contacts />
      </div>
    </>
  );
}
