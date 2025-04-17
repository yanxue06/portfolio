import * as React from "react";
import "../styles/home.css";
import "../styles/timeline.css";
import "../styles/arrow.scss";
import { motion } from "framer-motion";
import TypeWriter from "./typewriter";
import "../styles/stars.scss";
import { Button } from "@/components/ui/button";

export default function intro() {
  // Create a responsive array of stars
  const getStars = () => {
    // Default number for larger screens
    const defaultStars = 15;
    // Smaller number for mobile screens
    const mobileStars = 8;

    return Array(window.innerWidth > 750 ? defaultStars : mobileStars)
      .fill(0)
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
                variant="intro"
                className="bg-[#365172] text-white transition-transform hover:scale-105 hover:shadow-md"
                onClick={() =>
                  window.open("https://linkedin.com/in/yanxue-ce/", "_blank")
                }
              >
                LINKEDIN
              </Button>

              {/* Resume Button */}
              <Button
                variant="intro"
                className="border border-[#aacdf8] bg-white text-black transition-transform hover:scale-105 hover:shadow-md"
                onClick={() =>
                  window.open(
                    "https://drive.google.com/file/d/14kh81yd2DY1tn5Na59kQVCM55NkZiuF-/view?usp=sharing",
                    "_blank",
                  )
                }
              >
                RESUME
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
