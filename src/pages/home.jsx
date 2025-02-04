import * as React from "react";
import "../styles/home.css";
import "../styles/particle.scss";
import "../styles/timeline.css";
import TimeLine from "../components/timeline";
import Intro from "../components/intro";
import About from "../components/about";
import Projects from "../components/projects";
import Arrows from "../components/arrow";
import "../styles/navbar.css";

import TechStack from '../components/techstack';
import Contacts from '../components/contacts';
import ProjectShowcase from "../components/projectShowcase";
export default function App() {
    return (
        <>
            <div className="max-w-[1000px] mx-auto px-4">
                <Arrows />

                <Intro />

                <section className="p2">
                    <div className="col"> 
                        <About />

                        <TimeLine />

                        <ProjectShowcase/>
                        
                        <TechStack/> 
                    </div> 
                </section>

                
                <Projects />

                <Contacts/> 
                
            </div>
        </>
    );
}
