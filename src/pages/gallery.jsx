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
      { img: g1, title: 'Gallery Image 1' },
      { img: g2, title: 'Gallery Image 2' },
      { img: g3, title: 'Gallery Image 3' },
      { img: g4, title: 'Gallery Image 4' },
      { img: g5, title: 'Gallery Image 5' },
      { img: g6, title: 'Gallery Image 6' },
      { img: g7, title: 'Gallery Image 7' },
      { img: g8, title: 'Gallery Image 8' },
      { img: g9, title: 'Gallery Image 9' },
      { img: g10, title: 'Gallery Image 10' },
      { img: g11, title: 'Gallery Image 11' },
      { img: g12, title: 'Gallery Image 12' }
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
    <div className="p3">
      <div className="photos">
        under construction... 
      </div>
      <div className="gallery">
        <Box sx={{ 
          width: '90%', 
          maxWidth: 1200,
          height: 'auto',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <ImageList variant="masonry" cols={3} gap={12}>
            {itemData.map((item, index) => (
              <ImageListItem 
                key={item.img}
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
                  style={{ borderRadius: '8px' }}
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
