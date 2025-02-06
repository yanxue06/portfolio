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
        color: "rgb(231, 232, 229)", // Soft white text
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1.5), // Rounded corners
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Subtle shadow
        position: "relative", // To add arrow
        whiteSpace: "normal", // Allow text to wrap within the card
        wordWrap: "break-word", // Ensure long words break and wrap
        "&:before": {
            content: '""',
            position: "absolute",
            top: "10%",
            left: "-10px",
            width: "0",
            height: "0",
            borderStyle: "solid",
            borderWidth: "10px 10px 10px 0",
            borderColor: "transparent #3a3b5a transparent transparent", // Matches the background
        },
        transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
        ":hover": {
            transform: "scale(1.01)", // Slight zoom-in on hover
            boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
        },
        width: "60%",
        textAlign: "left",
    }));

    const RightArrowPaper = styled(CustomPaper)({
        "&:before": {
            left: "auto",
            right: "-10px", // Arrow points to the right
            borderWidth: "10px 0 10px 10px",
            borderColor: "transparent transparent transparent #3a3b5a",
        },
        transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
        ":hover": {
            transform: "scale(1.01)", // Slight zoom-in on hover
            boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
        },
        width: "60%",
        textAlign: "left",
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
            <motion.div
                initial={{ x: 0, opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.8 }}
            >
                <div id="experience">
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
            <section className="timeline">
                
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
                                  display: "block",
                                  height: "80px", // adjust this value as needed
                                  backgroundColor: "rgb(120, 134, 167)",
                                  margin: "0 auto", // centers the connector
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
                                        - Developing web applications to serve
                                        over 1,000,000 people
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
                                    // Let it grow if needed, but always have at least 50px height
                                    minHeight: "100px",
                                    flexGrow: 1,
                                    backgroundColor: "rgb(120, 134, 167)",
                                    // Ensure it stretches vertically
                                    alignSelf: "stretch",
                                    margin: "0 auto",
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
                                        - Created a backup driver to ensure data
                                        handling during power loss.
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
                                  display: "block",
                                  height: "80px", // adjust this value as needed
                                  backgroundColor: "rgb(120, 134, 167)",
                                  margin: "0 auto", // centers the connector
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
                                        - Automating workflows with Python
                                        scripts.
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
                            <TimelineConnector 
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
                                <PaperComponent
                                    sx={{
                                        transition:
                                            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                                        ":hover": {
                                            transform: "scale(1.01)", // Slight zoom-in on hover
                                            boxShadow:
                                                "0 0 6px 10px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
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
                                        sx={{ marginTop: "8px" }}
                                    >
                                        - Taught children aerodynamics and
                                        leadership skills.
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
