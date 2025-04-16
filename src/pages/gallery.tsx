// about.jsx
import React, { useEffect, useState } from "react";

import "../styles/gallery.css";
import Contacts from "../components/contacts";

import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

export default function Gallery() {
  const [loadedImages, setLoadedImages] = useState({});
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    window.scrollTo(0, 0);

    // Add window resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine responsive values based on window width
  const getResponsiveValues = () => {
    // Default (desktop)
    let containerWidth = "75%";
    let columns = 3;

    // Tablet
    if (windowWidth < 900) {
      containerWidth = "85%";
      columns = 2;
    }

    // Mobile
    if (windowWidth < 600) {
      containerWidth = "90%";
      columns = 1;
    }

    return { containerWidth, columns };
  };

  const { containerWidth, columns } = getResponsiveValues();

  // Create an array of image data using string paths instead of imports
  const itemData = [
    // Original images
    { img: "/images/gallery/g1.png", title: "Vancouver, BC" },
    { img: "/images/gallery/g2.png", title: "Vancouver, BC" },
    { img: "/images/gallery/g3.png", title: "Vancouver, BC" },
    { img: "/images/gallery/g4.png", title: "Vancouver, BC" },
    { img: "/images/gallery/g5.png", title: "Waterloo, ON" },
    { img: "/images/gallery/g6.png", title: "Waterloo, ON" },
    { img: "/images/gallery/g7.png", title: "Vancouver, BC" },
    { img: "/images/gallery/g8.png", title: "Toronto, ON" },
    { img: "/images/gallery/g9.png", title: "Waterloo, ON" },
    { img: "/images/gallery/g10.png", title: "Vancouver, BC" },
    { img: "/images/gallery/g11.png", title: "Ontario Skys" },
    { img: "/images/gallery/g12.png", title: "Vancouver, BC" },
    // New images
    { img: "/images/gallery/g13.png", title: "XuanCheng, China" },
    { img: "/images/gallery/g14.png", title: "Hangzhou, China" },
    { img: "/images/gallery/g15.png", title: "Anhui, China" },
    { img: "/images/gallery/g16.png", title: "Anhui, China" },
    { img: "/images/gallery/g17.png", title: "GOOGLE PLEASE HIRE ME" },
  ];

  // Handle image load
  const handleImageLoad = (index) => {
    // Add a small delay proportional to the image index
    setTimeout(() => {
      setLoadedImages((prev) => ({
        ...prev,
        [index]: true,
      }));
    }, index * 300);
  };

  return (
    <div className="galleryPage">
      <div className="gallery">
        <Box
          sx={{
            width: containerWidth,
            margin: "0 auto",
            overflow: "hidden",
            position: "relative",
            minHeight: windowWidth < 600 ? "800px" : "1200px",
          }}
        >
          <ImageList
            variant="masonry"
            cols={columns}
            gap={windowWidth < 600 ? 8 : 12}
            sx={{ overflow: "hidden" }}
          >
            {itemData.map((item, index) => (
              <ImageListItem
                key={item.img}
                data-title={item.title}
                sx={{
                  opacity: loadedImages[index] ? 1 : 0,
                  transform: loadedImages[index]
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  style={{
                    borderRadius: "1px",
                    width: "100%",
                    height: "auto",
                  }}
                  // This triggers when the image finishes loading
                  onLoad={() => handleImageLoad(index)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </div>
      <Contacts />
    </div>

    //create a 2 by 2 grid with fade in and fade out... each photo maybe can click in with a short description
  );
}
