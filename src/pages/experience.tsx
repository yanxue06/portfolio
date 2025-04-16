import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Contacts from "../components/contacts";
import "../styles/stars.scss";
import "../styles/experience.css";

const Experience = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Create a responsive array of stars like in intro page
  const getStars = () => {
    // Default number for larger screens
    const defaultStars = 20;
    // Smaller number for mobile screens
    const mobileStars = 12;

    return Array.from({
      length: window.innerWidth > 750 ? defaultStars : mobileStars,
    }).map((_, i) => (
      <div
        key={i}
        className="star"
        style={{
          color: "white",
        }}
      ></div>
    ));
  };

  return (
    <>
      <section
        className="timeline-section"
        style={{
          paddingTop: "80px",
          backgroundColor: "#161D25",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="stars experience-stars">{getStars()}</div>

        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
          viewport={{ once: true, amount: 0.8 }}
          className="experience-title-container"
        >
          <h1 className="experience-title">Experience</h1>
          <div className="title-underline"></div>
        </motion.div>

        <div className="experience-placeholder">
          <p>
            Experience timeline placeholder - will be replaced with shadcn
            components
          </p>
        </div>
      </section>
      <Contacts />
    </>
  );
};

export default Experience;
