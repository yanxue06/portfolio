// about.jsx
import React, { useEffect, useState } from "react";
import Typewriter from '../components/typewriter'

import '../styles/gallery.css'
import g1 from '../images/gallery/g1.png'
import g2 from '../images/gallery/g2.png'
import g3 from '../images/gallery/g3.png'
import g4 from '../images/gallery/g4.png'
import g5 from '../images/gallery/g5.png'
import g6 from '../images/gallery/g6.png'
import g7 from '../images/gallery/g7.png'
import g8 from '../images/gallery/g8.png'
import g9 from '../images/gallery/g9.png'
import g10 from '../images/gallery/g10.png'
import g11 from '../images/gallery/g11.png'
import g12 from '../images/gallery/g12.png'
// Import the new images
import g13 from '../images/gallery/g13.png'
import g14 from '../images/gallery/g14.png'
import g15 from '../images/gallery/g15.png'
import g16 from '../images/gallery/g16.png'
import g17 from '../images/gallery/g17.png'
import Contacts from '../components/contacts';

import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

export default function Gallery() {
     
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
    
    // State to track which images have loaded
    const [loadedImages, setLoadedImages] = useState({});
    
    // Create an array of image data from your imported images
    const itemData = [
      // Original images
      { img: g1, title: 'Vancouver, BC' },
      { img: g2, title: 'Vancouver, BC' },
      { img: g3, title: 'Vancouver, BC' },
      { img: g4, title: 'Vancouver, BC' },
      { img: g5, title: 'Waterloo, ON' },
      { img: g6, title: 'Waterloo, ON' },
      { img: g7, title: 'Vancouver, BC' },
      { img: g8, title: 'Toronto, ON' },
      { img: g9, title: 'Waterloo, ON' },
      { img: g10, title: 'Vancouver, BC' },
      { img: g11, title: 'Ontario Skys' },
      { img: g12, title: 'Vancouver, BC' },
      // New images
      { img: g13, title: 'New Adventure' },
      { img: g14, title: 'Hangzhou, China' },
      { img: g15, title: 'Anhui, China' },
      { img: g16, title: 'Anhui, China' },
      { img: g17, title: 'GOOGLE PLEASE HIRE ME' }
    ];
    
    // Handle image load
    const handleImageLoad = (index) => {
      // Add a small delay proportional to the image index
      setTimeout(() => {
        setLoadedImages(prev => ({
          ...prev,
          [index]: true
        }));
      }, index * 150); // 150ms delay between each image appearing
    };
    
  return (
    <div className="galleryPage">
      <div className="gallery">
        <Box sx={{ 
          width: '90%', 
          maxWidth: 1200,
          height: 'auto',
          margin: '0 auto',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <ImageList variant="masonry" cols={3} gap={12}>
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
