import React from 'react';
import { motion } from "framer-motion";
import Trackify from "/images/projects/Trackify.svg";
import { Box, Button, Card, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import '../styles/projectShowcase.css';

function ProjectShowcase() {
  return (
    <section className="projects-showcase" style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Card.Root
          overflow="hidden"
          css={{
            width: "70%",
            maxWidth: "1200px",
            backgroundColor: "#2B3F57",
            boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            borderRadius: "8px",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
            },
            "@media (max-width: 780px)": {
              flexDirection: "column",
              width: "90%", 
            },
          }}
        >
          <Image
            objectFit="cover"
            css={{
              width: "50%",
              height: "auto",
              borderRadius: "8px",
              "@media (max-width: 780px)": {
                width: "100%",
                marginRight: 0,
                marginBottom: "20px",
                objectFit: "cover",
                objectPosition: "center",
              },
            }}
            src={Trackify}
            alt="Project Preview"
          />
          <Box css={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            "@media (max-width: 780px)": {
              padding: "0 12px"
            }
          }}>
            <Card.Body>
              <Card.Title
                mb="2"
                css={{
                  fontSize: "clamp(24px, 3vw, 28px)",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Projects
              </Card.Title>
              <Card.Description
                css={{
                  color: "rgb(220, 229, 251)",
                  width: "90%",
                  fontSize: "clamp(18px, 2vw, 25px)",
                  lineHeight: "1.4",
                  maxWidth: "100%",
                  "@media (max-width: 780px)": {
                    fontSize: "20px"
                  }
                }}
              >
                I've made over 10 projects in the past 6 months. Throughout my first few projects, my goal was just to learn. But, with my  
                recent projects, I've been able to create tools that solve real-world problems, primarily focusing on productivity.
              </Card.Description>
            </Card.Body>
            <Card.Footer
              css={{
                marginTop: "16px",
                display: "flex",
                gap: "8px",
                "@media (max-width: 780px)": {
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  marginBottom: "16px"
                }
              }}
            >
              <Button
                as={Link}
                to="/projects"
                className="project-showcase-button"
                _hover={{ bg: "rgba(141, 140, 178, 0.79)" }}
              >
                <span style={{ color: "rgb(220, 229, 251)" }}>See more ›</span>
              </Button>
            </Card.Footer>
          </Box>
        </Card.Root>
      </motion.div>
    </section>
  );
}

export default ProjectShowcase;
