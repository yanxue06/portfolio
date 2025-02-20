import React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import WorkIcon from "@mui/icons-material/Work";
import BuildIcon from "@mui/icons-material/Build";
import { Card, For } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {useMediaQuery } from "@mui/material";

const TimeLine = () => {
    // Styling for the card content with text wrapping
    const CustomPaper = styled(Paper)(({ theme }) => ({
        backgroundColor: "#66789F",
        color: "rgb(231, 232, 229)",
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1.5),
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
        position: "relative",
        whiteSpace: "normal",
        wordWrap: "break-word",
        "&:before": {
          content: '""',
          position: "absolute",
          top: "10%",
          left: "-10px",
          width: "0",
          height: "0",
          borderStyle: "solid",
          borderWidth: "10px 10px 10px 0",
          borderColor: "transparent #3a3b5a transparent transparent",
        },
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        ":hover": {
          transform: "scale(1.01)",
          boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
        },
      
        /* Default width: 60% */
        width: "60%",
        textAlign: "left",
      
        /* Media query: At 1600px and up => set width to 600px */
        "@media (min-width:1600px)": {
            width: "600px",
        },
        "@media (max-width: 1599px)": { 
            width: "80%"
        }


      }));
      
      const RightArrowPaper = styled(CustomPaper)({
        "&:before": {
          left: "auto",
          right: "-10px", // Arrow points to the right
          borderWidth: "10px 0 10px 10px",
          borderColor: "transparent transparent transparent #3a3b5a",
        },
        marginLeft: "auto",
      });

    // This hook returns true when the viewport width is at least 1000px.
    const isLargeScreen = useMediaQuery("(min-width:1000px)");

    // Conditionally set the timeline position:
    // 'alternate' on large screens and 'right' on smaller screens.
    const timelinePosition = isLargeScreen ? "alternate" : "right";

    const PaperComponent = isLargeScreen ? RightArrowPaper : CustomPaper;

    return (

        <>
            
            <section className="timeline">
                <motion.div
                    initial={{ x: 0, opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                >
                    <div id="experience" style={{ marginBottom: "20px" }}>
                        <For each={["subtle"]}>
                            {(variant) => (
                                <Card.Root
                                    style={{
                                        width: window.innerWidth < 660 ? "80%" : "40%", // Adjust the width dynamically
                                        margin: "0 auto" // Optional: Center the element for smaller screens
                                    }}
                                    variant={variant}
                                    key={variant}
                                    css={{
                                        border: "2px solid rgba(235, 235, 235, 0.6)", // Outline
                                        backgroundColor: "#2B3F57",
                                        borderRadius: "8px", // Rounded corners
                                        transition:
                                            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover effect
                                        "&:hover": {
                                            transform: "scale(1.02)", // Slight zoom on hover
                                            boxShadow:
                                                "0 0 10px rgba(255, 255, 255, 0.2)", // Shadow on hover
                                        },
                                    }}
                                >
                                    <Card.Body
                                        gap="2"
                                        css={{ textAlign: "center" }}
                                    >
                                        <Card.Title
                                            mb="2"
                                            css={{
                                                fontSize: "35px",
                                                fontWeight:
                                                    "bold" /* Make the text bold */,
                                                color: "white" /* White text color for contrast */,
                                                letterSpacing:
                                                    "3px" /* Add spacing between letters */,
                                            }}
                                        >
                                            Experience
                                        </Card.Title>
                                    </Card.Body>
                                </Card.Root>
                            )}
                        </For>
                    </div>
                </motion.div>
                {/* Item 1 */}
                <Timeline
                    position={timelinePosition}
                    sx={{
                        "@media (max-width: 1000px)": {
                            left: "0",
                            width: "100%",
                        },
                    }}
                >
                    <TimelineItem
                        sx={{
                            width: "100%",
                            margin: "0", // Ensures even spacing on both sides
                            padding: "0px", // Remove any unintended padding
                            "@media (max-width: 1000px)": {
                                flexDirection: "row",
                                alignItems: "flex-start",
                                width: "100%",
                            },
                        }}
                    >
                        <TimelineOppositeContent
                            sx={{
                                m: "auto 0",
                                color: "rgba(255, 255, 255, 0.94)",
                                "@media (max-width: 1000px)": {
                                    display: "none",
                                },
                            }}
                        >
                            Jan 2025 - present
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot
                                sx={{ backgroundColor: "rgb(120, 134, 167)" }}
                            >
                                <LaptopMacIcon />
                            </TimelineDot>
                            <TimelineConnector 
                              sx={{
                                "@media (max-width: 1000px)": {
                                  height: "120px", // adjust this value as needed
                                  backgroundColor: "rgb(120, 134, 167)",
                                },
                                "@media (max-width: 778px)": {
                                  height: "145px", // adjust this value as needed
                                },
                                "@media (max-width: 730px)": {
                                  height: "145px", // adjust this value as needed
                                },
                                "@media (max-width: 639px)": {
                                  height: "200px", // adjust this value as needed
                                },
                                "@media (max-width: 533px)": {
                                  height: "230px", // adjust this value as needed
                                },
                                "@media (max-width: 440px)": {
                                  height: "320px", // adjust this value as needed
                                },
                                "@media (max-width: 382px)": {
                                  height: "340px", // adjust this value as needed
                                },
                                "@media (max-width: 382px)": {
                                  height: "360px", // adjust this value as needed
                                },
                              }}
                            />
                        </TimelineSeparator>
                        <TimelineContent
                            sx={{
                                "@media (max-width: 1000px)": {
                                    flex: 1,
                                    marginLeft: "16px",
                                },
                            }}
                        >
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <CustomPaper
                                    sx={{
                                        transition:
                                            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                        ":hover": {
                                            transform: "scale(1.01)", // Slight zoom-in on hover
                                            boxShadow:
                                                "0 0 6px 10px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                        },
                                        "@media (max-width: 1000px)": {
                                            width: "100%"
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="span"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        Software Engineering Intern | HongMall
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontStyle: "italic",
                                            color: "rgba(200, 210, 230, 255)",
                                        }}
                                    >
                                        Markham, ON
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            marginTop: "8px",
                                            width: "100%",
                                        }}
                                    >
                                        - Developed a prototype autonomous robot control system using <b>React</b>, <b>Flask</b>, and <b>Python</b>, integrating <b>15+ </b>
                                        Robot endpoints to support real-time navigation, object avoidance, and stock retrieval for over <b>50,000+ </b>
                                        warehouse items.
                                    </Typography>
                                </CustomPaper>
                            </motion.div>
                        </TimelineContent>
                    </TimelineItem>

                    {/* Item 2 */}

                    <TimelineItem
                        sx={{
                            "@media (max-width: 1000px)": {
                                flexDirection: "row",
                                alignItems: "flex-start",
                            },
                        }}
                    >
                        <TimelineOppositeContent
                            sx={{
                                m: "auto 0",
                                "@media (max-width: 1000px)": {
                                    display: "none",
                                },
                            }}
                            color="white"
                        >
                            Sep 2024 - Dec 2024
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot sx={{ backgroundColor: "rgb(120, 134, 167)" }}>
                                <LaptopMacIcon />
                            </TimelineDot>
                            <TimelineConnector
                                sx={{
                                    "@media (max-width: 1000px)": {
                                      height: "130px", // adjust this value as needed
                                      backgroundColor: "rgb(120, 134, 167)",
                                    },
                                    "@media (max-width: 700px)": {
                                      height: "178px", // adjust this value as needed
                                    },
                                    "@media (max-width: 550px)": {
                                      height: "230px", // adjust this value as needed
                                    },
                                    "@media (max-width: 471px)": {
                                      height: "250px", // adjust this value as needed
                                    },
                                    "@media (max-width: 440px)": {
                                      height: "300px", // adjust this value as needed
                                    },
                                    "@media (max-width: 370px)": {
                                      height: "340px", // adjust this value as needed
                                    },
                                  
                                  }}
                                />
                        </TimelineSeparator>


                        <TimelineContent
                            sx={{
                                py: "12px",
                                px: 2,
                                "@media (max-width: 1000px)": {
                                    flex: 1,
                                    marginLeft: "16px",
                                },
                            }}
                        >
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <PaperComponent /* block level component, upper level text aligns will not affect */
                                    sx ={{ 
                                        "@media (max-width: 1000px)": {
                                            width: "100%"
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="span"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        Firmware Member | Midnight Sun
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontStyle: "italic",
                                            color: "rgba(200, 210, 230, 255)",
                                        }}
                                    >
                                        Waterloo, ON
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ marginTop: "8px", width: "100%" }}
                                    >
                                        - Created a backup driver to ensure data handling during power loss.   
                                        <br />
                                        - Implemented an ADC driver with C firmware and I2C communication to read and convert temperature
                                        readings from raw voltage values.
                                    </Typography>
                                </PaperComponent>
                            </motion.div>
                        </TimelineContent>
                    </TimelineItem>

                    {/* Item 3 */}
                    <TimelineItem
                        sx={{
                            "@media (max-width: 1000px)": {
                                flexDirection: "row",
                                alignItems: "flex-start",
                            },
                        }}
                    >
                        <TimelineOppositeContent
                            sx={{
                                m: "auto 0",
                                "@media (max-width: 1000px)": {
                                    display: "none",
                                },
                            }}
                            color="white"
                        >
                            Feb 2023 - Aug 2024
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot
                                sx={{ backgroundColor: "rgb(120, 134, 167)" }}
                            >
                                <WorkIcon />
                            </TimelineDot>
                            <TimelineConnector
                             sx={{
                                "@media (max-width: 1000px)": {
                                  height: "100px", // adjust this value as needed
                                  backgroundColor: "rgb(120, 134, 167)",
                                },
                                "@media (max-width: 730px)": {
                                  height: "138px", // adjust this value as needed
                                },
                                "@media (max-width: 550px)": {
                                  height: "160px", // adjust this value as needed
                                },
                                "@media (max-width: 471px)": {
                                  height: "180px", // adjust this value as needed
                                },
                                "@media (max-width: 440px)": {
                                  height: "225px", // adjust this value as needed
                                },
                                "@media (max-width: 382px)": {
                                  height: "265px", // adjust this value as needed
                                },
                              }}
                            />
                        </TimelineSeparator>
                        <TimelineContent
                            sx={{
                                "@media (max-width: 1000px)": {
                                    flex: 1,
                                    marginLeft: "16px",
                                },
                            }}
                        >
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <CustomPaper
                                    sx={{
                                        transition:
                                            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                        ":hover": {
                                            transform: "scale(1.01)", // Slight zoom-in on hover
                                            boxShadow:
                                                "0 0 6px 10px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                        },
                                        "@media (max-width: 1000px)": {
                                            width: "100%"
                                        },
                                        
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="span"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        Automation Developer | Skynet Security
                                        System
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontStyle: "italic",
                                            color: "rgba(200, 210, 230, 255)",
                                        }}
                                    >
                                        Vancouver, BC
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ marginTop: "8px", width: "100%" }}
                                    >
                                        - Developed Python Scripts to automate company workflows, including ping testing and data cleaning.
                                    </Typography>
                                </CustomPaper>
                            </motion.div>
                        </TimelineContent>
                    </TimelineItem>

                    {/* Item 4 */}
                    <TimelineItem
                        sx={{
                            "@media (max-width: 1000px)": {
                                flexDirection: "row",
                                alignItems: "flex-start",
                                width: "100%", 
                            },
                        }}
                    >
                        <TimelineOppositeContent
                            sx={{
                                m: "auto 0",
                                "@media (max-width: 1000px)": {
                                    display: "none",
                                },
                            }}
                            color="white"
                        >
                            Sep 2024 - Dec 2024
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot
                                sx={{ backgroundColor: "rgb(120, 134, 167)" }}
                            >
                                <BuildIcon />
                            </TimelineDot>
                           
                        </TimelineSeparator>
                        <TimelineContent
                            sx={{
                                "@media (max-width: 1000px)": {
                                    flex: 1,
                                    marginLeft: "16px",
                                },
                            }}
                        >
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <PaperComponent
                                    sx={{
                                        transition:
                                            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                        ":hover": {
                                            transform: "scale(1.01)", // Slight zoom-in on hover
                                            boxShadow:
                                                "0 0 6px 10px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                                        },
                                        "@media (max-width: 1000px)": {
                                            width: "100%"
                                        },
                                        
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="span"
                                        sx={{
                                            fontWeight: "bold",
                                            width: "100%",
                                        }}
                                    >
                                        Engineering Instructor | Simon Fraser
                                        University (SFU) Camps
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontStyle: "italic",
                                            color: "rgba(200, 210, 230, 255)",
                                        }}
                                    >
                                        Vancouver, BC
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ 
                                            marginTop: "8px", 
                                            width: "100%"
                                        }}
                                    >
                                        - Collaborated with staff to oversee STEM lessons and icebreakers
                                        <br/> 
                                        - Constructed a curriculum on Aerodynamics for 20+ youth aerodynamics 
                                    </Typography>
                                </PaperComponent>
                            </motion.div>
                        </TimelineContent>
                    </TimelineItem>
                </Timeline>
            </section>
        </>
    );
};

export default TimeLine;
