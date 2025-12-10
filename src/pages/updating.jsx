import React from "react";
import { motion } from "framer-motion";
import "../styles/home.css";

export default function Updating() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000000",
      color: "white",
      padding: "40px 20px"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: "center",
          maxWidth: "600px"
        }}
      >
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: "bold",
          marginBottom: "20px",
          background: "linear-gradient(90deg, #63d0f8, #65b5ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Resume need updating lol  
        </h1>
     
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "rgba(99, 208, 248, 0.2)",
            color: "#63d0f8",
            textDecoration: "none",
            borderRadius: "8px",
            border: "1px solid rgba(99, 208, 248, 0.3)",
            transition: "all 0.3s ease",
            fontSize: "1rem"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(99, 208, 248, 0.3)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(99, 208, 248, 0.2)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Return Home
        </a>
      </motion.div>
    </div>
  );
}

