import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/projectShowcase.css";

function ProjectShowcase() {
  return (
    <section className="projects-showcase" style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <div className="project-showcase-placeholder">
          <p>
            Project showcase placeholder - will be replaced with shadcn
            components
          </p>
          <Link to="/projects" className="project-showcase-button">
            See more
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default ProjectShowcase;
