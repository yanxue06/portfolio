import * as React from "react";
import "../styles/home.css";
import "../styles/particle.scss";
import "../styles/timeline.css";
import "../styles/arrow.scss";

import Yan from "/images/Yan.jpeg";
import "../styles/navbar.css";
import { motion } from "framer-motion";
import { Box, Button, Card, Image } from "@chakra-ui/react";

export default function About() {
    return (
        <section id="about" className="about">
            <motion.div
                initial={{ x: -40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.2 }}
            >
                <Card.Root
                    overflow="hidden"
                    css={{
                        width: "85%", // Adjusted to 85% of the screen width
                        backgroundColor: "#2B3F57", 
                        maxWidth: "1200px",
                        boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "row", // Default layout
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
                        },
                        "@media (max-width: 780px)": {
                            flexDirection: "column", // Stack vertically on mobile
                            width: "90%", // Slightly wider on mobile
                        },
                    }}
                >
                    <Image
                        objectFit="cover"
                        loading="lazy"
                        css={{
                          width: "40%",
                          height: "auto",
                          borderRadius: "8px",
                          marginRight: "16px",
                          "@media (max-width: 780px)": {
                            width: "100%",
                            height: "600px", // Fixed height for cropping
                            marginRight: 0,
                            marginBottom: "20px",
                            objectFit: "cover", // Force crop
                            objectPosition: "center", // Focus on the center (your face)
                          },
                        }}
                        src={Yan}
                        alt="About Me"
                    />
                    <Box css={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between", // Ensures footer sticks to the bottom
                        "@media (max-width: 780px)": {
                            padding: "0 12px" // Add some side padding on mobile
                        }
                    }}>
                        <Card.Body>
                            <Card.Title
                                mb="2"
                                css={{
                                    fontSize: "clamp(24px, 3vw, 28px)",
                                    fontWeight: "bold",
                                }}
                            >
                                About Me
                            </Card.Title>
                            <Card.Description
                                css={{
                                    color: "rgb(220, 229, 251)", 
                                    width: "90%", 
                                    fontSize: "clamp(18px, 2vw, 25px)",
                                    lineHeight: "1.4",
                                    maxWidth: "100%",
                                    "@media (max-width: 780px)": {
                                        fontSize: "20px" // Slightly smaller text on mobile
                                    }
                                }}
                            >
                                Hey! I'm Yan, a passionate software developer and AI enthusiast 
                                studying Computer Engineering at The University of Waterloo. 
                                I'm originally from Vancouver, BC, but I'll be studying abroad 
                                at Waterloo, ON for the next few years. I'm always excited to 
                                improve my skills and explore new experiences.
                                <br /><br />
                                Beyond coding, I love guitar, chess, {/*(add me on chess.com <a 
                                    href="https://link.chess.com/friend/HFiGMJ" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#4d9fff", 
                                        textDecoration: "underline", 
                                        fontWeight: "500",
                                        transition: "color 0.2s ease", 
                                        "&:hover": {
                                            color: "#7cb5ff"  
                                        }
                                }} >here</a>) */}
                                soccer, table tennis, frisbee, and traveling.

                            </Card.Description>
                        </Card.Body>
                        <Card.Footer
                            css={{
                                marginTop: "16px",
                                display: "flex",
                                gap: "8px",
                                "@media (max-width: 780px)": {
                                    flexWrap: "wrap",
                                    justifyContent: "flex-start", // Buttons always left-aligned
                                    marginBottom: "16px"
                                }
                            }}
                        >
                            <Button
                                color="white"
                                backgroundColor="#66789F"
                                _hover={{ bg: "rgba(141, 140, 178, 0.79)" }}
                                onClick={() => window.location.href = "/gallery"}
                            >
                                Gallery
                            </Button>
                           
                        </Card.Footer>
                    </Box>
                </Card.Root>
            </motion.div>
        </section>
    );
}
