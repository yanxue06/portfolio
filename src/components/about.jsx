import * as React from 'react'; 
import '../Home.css'; 
import '../particle.scss'; 
import '../timeline.css';
import '../arrow.scss'

import Yan from '../images/Yan.jpeg'
import '../navbar.css';
import Grid2 from '@mui/material/Grid2';
import { motion } from "framer-motion";
import { Badge, Box, Button, Card, Image } from "@chakra-ui/react"



export default function About() { 
    return (
        <section id="about" className="about">
          <motion.div
            className="flex justify-center w-full py-8 md:mt-0 mt-32 overflow-hidden dark:text-[#ececec]"
            initial={{ x: 0, opacity: 0 }}
            whileInView={{ x: -10, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.8 }}
          >
            <Card.Root
              flexDirection="row"
              overflow="hidden"
              css={{
                width: "100%", // Set width as 60% of the screen
                backgroundColor: "rgb(22, 29, 37, 255)",  
                maxWidth: "1000px", // Optional: Add a maximum width
                boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)", // Subtle shadow
                transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                "&:hover": {
                  transform: "scale(1.02)", // Slight zoom-in on hover
                  boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                },
              }}
            >
              <Image
                objectFit="cover"
                css={{
                  width: "35%", // Image width as a percentage of the card
                  height: "auto", // Maintain aspect ratio
                  borderRadius: "8px",
                  marginRight: "16px",
                }}
                src={Yan}
                alt="About Me"
              />
              <Box>
                <Card.Body>
                  <Card.Title
                    mb="2"
                    css={{
                      fontSize: "clamp(20px, 2vw, 28px)", // Responsive font size
                      fontWeight: "bold",
                    }}
                  >
                    About Me
                  </Card.Title>
                  <Card.Description
                    css={{
                      fontSize: "clamp(14px, 1.5vw, 18px)", // Responsive font size
                      lineHeight: "1.6",
                    }}
                  >
                    Hey! I'm Yan, a passionate software developer and AI enthusiast
                    studying Computer Engineering at The University of Waterloo. I'm
                    originally from Vancouver, BC, but I'll be studying abroad at
                    Waterloo, ON for the next few years. I'm always excited to improve
                    my skills and explore new experiences. Feel free to reach out. I
                    am open to any and all opportunities!
                    <br />
                    <br />
                    In my spare time, I love to play guitar, chess, table tennis,
                    soccer, frisbee, and walking my absolutely EPIC dog: Rocky! Below
                    is my gallery, which are some of my photos taken throughout my
                    life, as well as my blog, where I write about random things.
                  </Card.Description>
                </Card.Body>
                <Card.Footer
                  css={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <Button
                    color="white"
                    backgroundColor = "rgba(54, 81, 114, 255)"
                    _hover={{ bg: "rgba(141, 140, 178, 0.79)" }}
                  >
                    Gallery
                  </Button>
                  <Button
                    color="white"
                    backgroundColor = "rgba(54, 81, 114, 255)"
                    _hover={{ bg: "rgba(141, 140, 178, 0.79)" }}
                  >
                    Blog
                  </Button>
                </Card.Footer>
              </Box>
            </Card.Root>
          </motion.div>
        </section>
      );
      
} 