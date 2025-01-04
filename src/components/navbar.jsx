import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../navbar.css";

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      console.log(window.scrollY); 
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`navbar ${scrollY > 0 ? "navbar-scrolled" : ""}`}
      // animate={{ opacity: scrollY > 0 ? 1 : 0.7 }}
      // transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a className="navbar-link" href='/'> Yan </a>
        </div>

        {/* Links */}
        <div className="navbar-links">
          {["ABOUT", "PROJECTS", "BLOG", "GALLERY", "CONTACT"].map((link) => (
            <a
              key={link}
              className="navbar-link"
              href={`/${link.toLowerCase()}`}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
