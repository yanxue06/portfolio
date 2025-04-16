import * as React from "react";
import "../styles/home.css";
import "../styles/particle.scss";
import "../styles/timeline.css";
import "../styles/arrow.scss";

import Yan from "/images/Yan.jpeg";
import "../styles/navbar.css";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="about" style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%" }}
      >
        <div className="about-placeholder">
          <p>About placeholder - will be replaced with shadcn components</p>
        </div>
      </motion.div>
    </section>
  );
}
