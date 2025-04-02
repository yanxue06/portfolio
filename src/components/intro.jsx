import * as React from "react";
import "../styles/home.css";
import "../styles/particle.scss";
import "../styles/timeline.css";
import "../styles/arrow.scss";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import TypeWriter from "./typewriter";
import "../styles/stars.scss";

export default function intro() {
  // Create a responsive array of stars
  const getStars = () => {
    // Default number for larger screens
    const defaultStars = 27;
    // Smaller number for mobile screens
    const mobileStars = 15;

    return Array(window.innerWidth > 750 ? defaultStars : mobileStars)
      .fill()
      .map((_, i) => (
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
    <section id="home" className="p1">
      <div
        className="stars"
        style={{
          color: "white",
        }}
      >
        {getStars()}
      </div>

      <motion.div
        className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
        initial={{ x: -10, opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.8 }}
      >
        <div className="intro">
          <div className="box">
            <div className="top-section">
              <TypeWriter />
              <span
                style={{
                  color: "white",
                }}
              >
                I'm
              </span>
              <div className="name">
                <span
                  style={{
                    color: "#aacdf8", // Change this to your desired color
                    fontWeight: "bold",
                    fontSize: "80px",
                  }}
                >
                  Yan
                </span>
              </div>
            </div>

            <div className="bottom-section">
              <span
                style={{
                  color: "white",
                }}
              >
                ECE Student at The University of Waterloo
              </span>
            </div>

            <div className="logo">
              <Button
                variant="contained"
                style={{
                  backgroundColor: "rgba(54, 81, 114, 255)",
                  color: "white",
                }}
                onClick={() =>
                  window.open("https://linkedin.com/in/yanxue-ce/", "_blank")
                }
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                  ":hover": {
                    transform: "scale(1.05)", // Slight zoom-in on hover
                    boxShadow: "0 0 2px 4px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                  },
                }}
              >
                LinkedIn
              </Button>

              {/* Resume Button */}
              <Button
                variant="outlined"
                style={{
                  borderColor: "#aacdf8",
                  backgroundColor: "#FFFFFF",
                  color: "black",
                }}
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                  ":hover": {
                    transform: "scale(1.05)", // Slight zoom-in on hover
                    boxShadow: "0 0 2px 4px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                  },
                }}
                onClick={() =>
                  window.open(
                    "https://drive.google.com/file/d/1ILOfLwwijZj3ubTjZVhDw18MbRARtB2w/view?usp=sharing",
                    "_blank",
                  )
                }
              >
                Resume
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
