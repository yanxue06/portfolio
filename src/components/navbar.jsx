import { useState, useEffect } from "react";
import "../styles/navbar.css";

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Add this function to handle link clicks
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Add this function to handle smooth scrolling
  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openResume = (e) => {
    e.preventDefault();
    window.location.href = "/resume";
    setIsMobileMenuOpen(false);
  };

  // Add these scroll functions
  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  // Add this scroll function for About section
  const scrollToAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  // Add this function to scroll to top
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`navbar ${scrollY > 0 ? "navbar-scrolled" : ""}`}
    >
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="#" className="navbar-link" onClick={scrollToTop}>
            Home
          </a>
        </div>

        {/* Desktop Links */}
        <div className="navbar-links">
          <a href="#about" className="navbar-link" onClick={scrollToAbout}>
            About
          </a>

          <a
            href="#projects"
            className="navbar-link"
            onClick={(e) => scrollToSection("projects", e)}
          >
            Projects
          </a>

          <a
            href="#experience"
            className="navbar-link"
            onClick={(e) => scrollToSection("experience", e)}
          >
            Experience
          </a>

          <a
            href="/resume"
            className="navbar-link"
          >
            Resume
          </a>

          <a href="#contact" className="navbar-link" onClick={scrollToContact}>
            Contact
          </a>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <a href="#about" className="navbar-link" onClick={scrollToAbout}>
            About
          </a>

          <a
            href="#projects"
            className="navbar-link"
            onClick={(e) => scrollToSection("projects", e)}
          >
            Projects
          </a>

          <a
            href="#experience"
            className="navbar-link"
            onClick={(e) => scrollToSection("experience", e)}
          >
            Experience
          </a>

          <a
            href="/resume"
            className="navbar-link"
            onClick={openResume}
          >
            Resume
          </a>

          <a
            href="#contact"
            className="navbar-link"
            onClick={(e) => {
              scrollToContact(e);
              handleLinkClick();
            }}
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
