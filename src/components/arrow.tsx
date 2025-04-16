import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/arrow.scss";

export default function ScrollArrow() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide the component after scrolling 100px
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="arrow-container"
      initial={{ opacity: 1, y: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20, // Move down slightly when disappearing
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="arrow"></div>
      <div className="arrow"></div>
      <div className="arrow"></div>
    </motion.div>
  );
}
