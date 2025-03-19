// about.jsx
import React, { useEffect, useState } from "react";

import '../styles/gallery.css'
import Contacts from   '../components/contacts';

import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

export default function Gallery() {
     
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
    
    // State to track which images have loaded
    const [loadedImages, setLoadedImages] = useState({});
    
    // Create an array of image data using string paths instead of imports
    const itemData = [
      // Original images
      { img: '/images/gallery/g1.png', title: 'Vancouver, BC' },
      { img: '/images/gallery/g2.png', title: 'Vancouver, BC' },
      { img: '/images/gallery/g3.png', title: 'Vancouver, BC' },
      { img: '/images/gallery/g4.png', title: 'Vancouver, BC' },
      { img: '/images/gallery/g5.png', title: 'Waterloo, ON' },
      { img: '/images/gallery/g6.png', title: 'Waterloo, ON' },
      { img: '/images/gallery/g7.png', title: 'Vancouver, BC' },
      { img: '/images/gallery/g8.png', title: 'Toronto, ON' },
      { img: '/images/gallery/g9.png', title: 'Waterloo, ON' },
      { img: '/images/gallery/g10.png', title: 'Vancouver, BC' },
      { img: '/images/gallery/g11.png', title: 'Ontario Skys' },
      { img: '/images/gallery/g12.png', title: 'Vancouver, BC' },
      // New images
      { img: '/images/gallery/g13.png', title: 'XuanCheng, China' },
      { img: '/images/gallery/g14.png', title: 'Hangzhou, China' },
      { img: '/images/gallery/g15.png', title: 'Anhui, China' },
      { img: '/images/gallery/g16.png', title: 'Anhui, China' },
      { img: '/images/gallery/g17.png', title: 'GOOGLE PLEASE HIRE ME' }
    ];
    
    // Handle image load
    const handleImageLoad = (index) => {
      // Add a small delay proportional to the image index
      setTimeout(() => {
        setLoadedImages(prev => ({
          ...prev,
          [index]: true
        }));
      }, index * 300); // 150ms delay between each image appearing
    };
    
  return (
    <div className="galleryPage">
      <div className="gallery">
        <Box sx={{ 
          width: '65%', 
          margin: '0 auto',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '1200px'
        }}>
          <ImageList 
            variant="masonry" 
            cols={3} 
            gap={12}
            sx={{ overflow: 'hidden' }}
          >
            {itemData.map((item, index) => (
              <ImageListItem 
                key={item.img}
                data-title={item.title}
                sx={{
                  opacity: loadedImages[index] ? 1 : 0,
                  transform: loadedImages[index] ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  style={{ borderRadius: '1px' }}
                  // This triggers when the image finishes loading
                  onLoad={() => handleImageLoad(index)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </div> 
      <Contacts/> 
    </div>
    
    //create a 2 by 2 grid with fade in and fade out... each photo maybe can click in with a short description 
  );
}
