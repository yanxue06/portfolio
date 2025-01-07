import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../navbar.css";

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Toggle the 'scrolled' class on the body
      if (window.scrollY > 50) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`navbar ${scrollY > 0 ? "navbar-scrolled" : ""}`}
      animate={{ opacity: scrollY > 0 ? 1 : 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a className="navbar-link" href="/">
            Yan
          </a>
        </div>

        {/* Links */}
        <div className="navbar-links">
          {["ABOUT", "PROJECTS", "GALLERY", "CONTACT"].map((link) => (
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
