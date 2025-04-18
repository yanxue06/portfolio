import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TimeLine = () => {
  return (
    <section style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <div className="timeline-placeholder">
          <p>I've made a </p>
        </div>
      </motion.div>
    </section>
  );
};

export default TimeLine;
