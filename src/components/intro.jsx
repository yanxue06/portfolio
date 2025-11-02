import React from "react";
import "../styles/home.css";
import "../styles/navbar.css";
import { motion } from "framer-motion";
import TypeWriter from "./typewriter";
import "../styles/stars.scss";

export default function intro() {
  // Create a responsive array of stars
  const getStars = () => {
    // Default number for larger screens
    const defaultStars = 15;
    // Smaller number for mobile screens
    const mobileStars = 8;

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
                Computer Engineering @ uWaterloo 
              </span>
            </div>

            <div className="logo">
              <button
                style={{
                  backgroundColor: "rgba(54, 81, 114, 255)",
                  color: "white",
                  padding: "6px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 0 2px 4px rgba(147, 143, 143, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
                onClick={() =>
                  window.open("https://linkedin.com/in/yanxue-ce/", "_blank")
                }
              >
                LinkedIn
              </button>

              <button
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "black",
                  padding: "6px 16px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 0 2px 4px rgba(147, 143, 143, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
                onClick={() =>
                  window.open("/resume.pdf", "_blank")
                }
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
