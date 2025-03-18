import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Use Link for navigation to routes
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
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };



    return (
        <motion.nav
            className={`navbar ${scrollY > 0 ? "navbar-scrolled" : ""}`}
            animate={{ opacity: scrollY > 0 ? 1 : 0.9 }}
            transition={{ duration: 0.5 }}
        >
            <div className="navbar-container">
                
                {/* Logo */}
                <div className="navbar-logo">
                    <Link to="/" className="navbar-link" onClick={handleLinkClick}>
                        Yan
                    </Link>
                </div>

                {/* Desktop Links */}
                <div className="navbar-links">
                    <Link to="/home" className="navbar-link">
                        HOME
                    </Link>

                    <Link to="/projects" className="navbar-link">
                        PROJECTS
                    </Link>

                    {/* <Link to="/gallery" className="navbar-link">
                        GALLERY
                    </Link> */}
                    <a href="/gallery" className="navbar-link">
                        GALLERY
                    </a>

                    <a href="#contact" className="navbar-link" onClick={scrollToContact}>
                        CONTACT
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
                <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/home" className="navbar-link" onClick={handleLinkClick}>
                        HOME
                    </Link>
                    <Link to="/projects" className="navbar-link" onClick={handleLinkClick}>
                        PROJECTS
                    </Link>
                    {/* <Link to="/gallery" className="navbar-link" onClick={handleLinkClick}>
                        GALLERY
                    </Link> */}
                    <a href="#contact" className="navbar-link" onClick={scrollToContact}>
                        CONTACT
                    </a>
                </div>

            </div>
        </motion.nav>
    );
}
