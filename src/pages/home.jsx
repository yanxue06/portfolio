import React, { useEffect } from "react";
import "../styles/home.css";
import "../styles/particle.scss";
import "../styles/timeline.css";
import TimeLine from "../components/timeline";
import Intro from "../components/intro";
import About from "../components/about";
import Arrows from "../components/arrow";
import "../styles/navbar.css";

import Contacts from "../components/contacts";

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
            <About />

            <TimeLine />

          </div>
        </section>

        {/* <Projects /> */}

        <Contacts />
      </div>
    </>
  );
}
