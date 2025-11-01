import { useState, useEffect } from "react";
import "../styles/home.css";
import "../styles/navbar.css";
import { motion } from "framer-motion";
import "../styles/about.css";
import SpotifyPlayer from "./SpotifyPlayer";

export default function About() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Gallery images array
  const galleryImages = [
    '/images/gallery/g1.png',
    '/images/gallery/g2.png',
    '/images/gallery/g3.png',
    '/images/gallery/g4.png',
    '/images/gallery/g5.png',
    '/images/gallery/g6.png',
    '/images/gallery/g7.png',
    '/images/gallery/g8.png',
    '/images/gallery/g9.png',
    '/images/gallery/g10.png',
    '/images/gallery/g11.png',
    '/images/gallery/g12.png',
    '/images/gallery/g13.png',
    '/images/gallery/g14.png',
    '/images/gallery/g15.png',
    '/images/gallery/g16.png',
    '/images/gallery/g17.png'
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % galleryImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [galleryImages.length]);



  return (
    <section id="about" className="about" style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%" }}
      >
        <div className="about-content">
          {/* Photo Carousel - Left Side on large screens */}
          <div className="about-carousel-container">
            <div className="about-carousel">
              <div className="carousel-image-container">
                <img 
                  src={galleryImages[currentImageIndex]} 
                  alt={`Gallery image ${currentImageIndex + 1}`}
                  className="carousel-image"
                />
              </div>
            </div>
          </div>

          {/* Description - Right Side on large screens */}
          <div className="about-text-container"> 
            <div className="about-text">
              <h1>
                About <span style={{
                  background: "linear-gradient(90deg, #63d0f8, #65b5ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Me</span>
              </h1>
              <p>
                Hey! I'm a computer engineering student at uWaterloo, who  
                strongly believes that software should be used to help people.    
              </p>
              <p>
                Besides coding, I also love guitar, frisbee, and chess :)   
              </p>
            </div>
            <SpotifyPlayer /> 
          </div>
        </div>
      </motion.div>
    </section>
  );
}
