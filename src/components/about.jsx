import * as React from "react";
import "../home.css";
import "../particle.scss";
import "../timeline.css";
import "../arrow.scss";

import Yan from "../images/Yan.jpeg";
import "../navbar.css";
import { motion } from "framer-motion";
import { Badge, Box, Button, Card, Image } from "@chakra-ui/react";

export default function About() {
    return (
        <section id="about" className="about">
            <motion.div
                initial={{ x: 0, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.8 }}
            >
                <Card.Root
                    overflow="hidden"
                    css={{
                        width: "85%", // Adjusted to 85% of the screen width
                        backgroundColor: "rgb(22, 29, 37, 255)",
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
                                    fontSize: "clamp(20px, 2vw, 28px)",
                                    fontWeight: "bold",
                                }}
                            >
                                About Me
                            </Card.Title>
                            <Card.Description
                                css={{
                                    fontSize: "clamp(18px, 2vw, 25px)",
                                    lineHeight: "1.4",
                                    maxWidth: "100%",
                                    "@media (max-width: 780px)": {
                                        fontSize: "16px" // Slightly smaller text on mobile
                                    }
                                }}
                            >
                                Hey! I'm Yan, a passionate software developer and AI enthusiast 
                                studying Computer Engineering at The University of Waterloo. 
                                I'm originally from Vancouver, BC, but I'll be studying abroad 
                                at Waterloo, ON for the next few years. I'm always excited to 
                                improve my skills and explore new experiences. Feel free to 
                                reach out. I am open to any and all opportunities!
                                <br /><br />
                                In my spare time, I love to play guitar, chess, table tennis, 
                                soccer, frisbee, and walking my absolutely EPIC dog: Rocky! 
                                Below is my gallery, which are some of my photos taken throughout 
                                my life, as well as my blog, where I write about random things.
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
                                backgroundColor="rgba(54, 81, 114, 255)"
                                _hover={{ bg: "rgba(141, 140, 178, 0.79)" }}
                            >
                                Gallery
                            </Button>
                            <Button
                                color="white"
                                backgroundColor="rgba(54, 81, 114, 255)"
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
