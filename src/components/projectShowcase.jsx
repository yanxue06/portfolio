import React from 'react';
import '../styles/projectShowcase.css';
import { motion } from "framer-motion";
import projectPic from "../images/projects/p3.svg"
import { Link } from "react-router-dom";


function ProjectShowcase() {
  return (
    <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
    >
        <section className="projects-section">

        {/* Project card container */}
        <div className="projects-card">
            {/* Left column: pink “image” placeholder */}
            <div className="projects-image">
                <img src={projectPic} alt="Project" />
            </div>


            {/* Right column: title, description, button */}
            <div className="projects-content">
            <h3 className="project-name"> Projects </h3>
            <p className="project-description">
                I've made over 12 projects in the past 6 months, each serving
                their own distinct purpose!
            </p>
            <button className="project-button">
                <Link to="/projects" className="project-link">See more ›</Link>
            </button>
            </div>
        </div>
        </section>
    </motion.div>
  );
}

export default ProjectShowcase;
