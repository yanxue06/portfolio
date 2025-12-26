import { useState, useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/TravelGlobe.css";

const GLOBE_IMAGE_URL = "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_IMAGE_URL = "https://unpkg.com/three-globe/example/img/earth-topology.png";

// Home location - Vancouver, BC
const homeLocation = {
  lat: 49.2827,
  lng: -123.1207,
  label: "Vancouver, BC 🏠",
  isHome: true,
  images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
};

// School location - Waterloo, Ontario
const schoolLocation = {
  lat: 43.4643,
  lng: -80.5204,
  label: "Waterloo, ON 🎓",
  isSchool: true,
  images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
};

// Travel destinations
const myTrips = [
  // Hawaii
  {
    lat: 19.5429,
    lng: -155.6659,
    label: "Big Island, Hawaii",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 21.3069,
    lng: -157.8583,
    label: "Honolulu, Hawaii",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 20.7984,
    lng: -156.3319,
    label: "Maui, Hawaii",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  // Caribbean & Mexico
  {
    lat: 21.5218,
    lng: -77.7812,
    label: "Cuba",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 21.1619,
    lng: -86.8515,
    label: "Cancun, Mexico",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  // UK
  {
    lat: 51.5074,
    lng: -0.1278,
    label: "London, UK",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  // Ontario, Canada
  {
    lat: 42.9849,
    lng: -81.2453,
    label: "London, Ontario",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 43.8561,
    lng: -79.3370,
    label: "Markham, Ontario",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 43.6532,
    lng: -79.3832,
    label: "Toronto, Ontario",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  // Europe
  {
    lat: 41.9028,
    lng: 12.4964,
    label: "Rome, Italy",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 48.8566,
    lng: 2.3522,
    label: "Paris, France",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 41.3874,
    lng: 2.1686,
    label: "Barcelona, Spain",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 38.7223,
    lng: -9.1393,
    label: "Lisbon, Portugal",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 37.5994,
    lng: 14.0154,
    label: "Sicily, Italy",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  // China
  {
    lat: 30.2741,
    lng: 120.1551,
    label: "Hangzhou, China",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 31.8206,
    lng: 117.2272,
    label: "Hefei, China",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 22.5431,
    lng: 114.0579,
    label: "Shenzhen, China",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  },
  {
    lat: 31.2304,
    lng: 121.4737,
    label: "Shanghai, China",
    color: "#00f3ff",
    size: 1.2,
    images: ["/images/gallery/g1.png", "/images/gallery/g2.png", "/images/gallery/g3.png"]
  }
];

export default function TravelGlobe() {
  const globeRef = useRef();
  const containerRef = useRef();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 650, height: 650 });

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setDimensions({ width: 340, height: 340 });
      } else if (width <= 768) {
        setDimensions({ width: 450, height: 450 });
      } else {
        setDimensions({ width: 650, height: 650 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Auto-rotate the globe
  useEffect(() => {
    if (globeRef.current && globeReady) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = false;
    }
  }, [globeReady]);

  // Handle marker click - open modal
  const handlePointClick = (point) => {
    setSelectedTrip(point);
    // Stop auto-rotation when modal is open
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
    }
  };

  // Handle special marker click (home or school)
  const handleSpecialMarkerClick = (location) => {
    setSelectedTrip(location);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
    }
  };

  // Create special marker HTML element (home or school)
  const createSpecialElement = (d) => {
    const el = document.createElement('div');
    
    if (d.isHome) {
      el.className = 'home-marker special-marker';
      el.innerHTML = `
        <div class="special-marker-icon home-icon">🏠</div>
        <div class="special-marker-pulse home-pulse"></div>
        <div class="special-marker-label">Vancouver, BC</div>
      `;
    } else if (d.isSchool) {
      el.className = 'school-marker special-marker';
      el.innerHTML = `
        <div class="special-marker-icon school-icon">🎓</div>
        <div class="special-marker-pulse school-pulse"></div>
        <div class="special-marker-label">Waterloo, ON</div>
      `;
    }
    
    el.onclick = () => handleSpecialMarkerClick(d);
    return el;
  };

  // Generate tooltip HTML for point markers
  const getPointLabel = (point) => {
    return `<div class="globe-point-tooltip">${point.label}</div>`;
  };

  // Special locations (home + school)
  const specialLocations = [homeLocation, schoolLocation];

  // Close modal
  const closeModal = () => {
    setSelectedTrip(null);
    // Resume auto-rotation when modal is closed
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
    }
  };

  return (
    <section className="travel-globe-section">
      <motion.div
        className="travel-globe-content"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="travel-globe-title">
          World <span className="travel-globe-title-highlight">Memory</span> Globe
        </h2>
        <p className="travel-globe-subtitle">
          Click on any marker to explore my travel memories
        </p>

        <div className="globe-wrapper">
          <div className="globe-container" ref={containerRef}>
            {!globeReady && (
              <div className="globe-loading">
                <div className="globe-loading-spinner"></div>
                <span>Loading Globe...</span>
              </div>
            )}
            <Globe
              ref={globeRef}
              globeImageUrl={GLOBE_IMAGE_URL}
              bumpImageUrl={BUMP_IMAGE_URL}
              backgroundColor="rgba(0,0,0,0)"
              showAtmosphere={true}
              atmosphereColor="#00d4ff"
              atmosphereAltitude={0.25}
              pointsData={myTrips}
              pointLat="lat"
              pointLng="lng"
              pointColor="color"
              pointAltitude={0.02}
              pointRadius="size"
              pointsMerge={false}
              pointLabel={getPointLabel}
              onPointClick={handlePointClick}
              htmlElementsData={specialLocations}
              htmlLat="lat"
              htmlLng="lng"
              htmlAltitude={0.05}
              htmlElement={createSpecialElement}
              onGlobeReady={() => setGlobeReady(true)}
              width={dimensions.width}
              height={dimensions.height}
              animateIn={true}
            />
          </div>
        </div>

        {/* Modal for photo gallery */}
        <AnimatePresence>
          {selectedTrip && (
            <motion.div
              className="globe-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="globe-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="globe-modal-close" onClick={closeModal}>
                  ✕
                </button>
                <h3 className="globe-modal-title">{selectedTrip.label}</h3>
                <p className="globe-modal-subtitle">Photo Gallery</p>
                <div className="globe-modal-gallery">
                  {selectedTrip.images.map((img, index) => (
                    <div key={index} className="gallery-item">
                      <img src={img} alt={`${selectedTrip.label} photo ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

