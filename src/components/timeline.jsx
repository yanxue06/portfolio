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
import {Card, For} from "@chakra-ui/react"


const CustomPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: "rgba(30, 47, 62, 255)", 
    color: "rgb(231, 232, 229)", // Soft white text
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5), // Rounded corners
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Subtle shadow
    position: "relative", // To add arrow
    "&:before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "-10px",
      transform: "translateY(-50%)",
      width: "0",
      height: "0",
      borderStyle: "solid",
      borderWidth: "10px 10px 10px 0",
      borderColor: "transparent #3a3b5a transparent transparent", // Matches the background
    },
  }));
  
  const RightArrowPaper = styled(CustomPaper)({
    "&:before": {
      left: "auto",
      right: "-10px", // Arrow points to the right
      borderWidth: "10px 0 10px 10px",
      borderColor: "transparent transparent transparent #3a3b5a",
    },
  });

const TimeLine = () => {
  return (
    <section className = "timeline"> 
        <Timeline position="alternate">
            <div id="experience" className="heading">
                <For each={["subtle"]}>
                    {(variant) => (
                        <Card.Root
                            width="80%"
                            variant={variant}
                            key={variant}
                            css={{
                            border: "2px solid rgba(235, 235, 235, 0.6)", // Outline
                            backgroundColor: "rgb(22, 29, 37, 255)", 
                            borderRadius: "8px", // Rounded corners
                            transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover effect
                            "&:hover": {
                                transform: "scale(1.02)", // Slight zoom on hover
                                boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)", // Shadow on hover
                            },
                            }}
                        >
                        <Card.Body 
                            gap="2"
                            css = {{
                                textAlign: "center", 
                            }} 
                        >
                        <Card.Title 
                            mb="2" 
                            css = {{ 
                                fontSize: "35px", 
                                fontWeight: "bold", /* Make the text bold */
                                color: 'white', /* White text color for contrast */
                                letterSpacing: '3px', /* Add spacing between letters */
                            }}
                        >
                        Experience
                        </Card.Title>
                        </Card.Body>
                    </Card.Root>
                    )}
                </For>
            </div>
    

            {/* Item 1 */}
            <TimelineItem>
                <TimelineOppositeContent sx={{ m: "auto 0", color: "rgba(255, 255, 255, 0.94)"}}>
                Jan 2025 - present
                </TimelineOppositeContent>
                <TimelineSeparator>
                <TimelineDot sx={{ backgroundColor: 'rgb(120, 134, 167)' }}>
                    <LaptopMacIcon />
                </TimelineDot>
                <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                <CustomPaper 
                    sx = {{ 
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                        ':hover': {
                        transform: 'scale(1.01)', // Slight zoom-in on hover
                        boxShadow: '0 0 6px 10px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                        }
                    }} 
                >
                    <Typography variant="h6" component="span" sx={{ fontWeight: "bold"}}>
                    Software Engineering Intern | HongMall
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "rgba(200, 210, 230, 255)"}}>
                    Markham, ON
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: "8px"}}>
                    - developign web applications to server over 1,000,000 people 
                    </Typography>
                </CustomPaper>
                </TimelineContent>
            </TimelineItem>

            {/* Item 2 */}
            <TimelineItem>
                <TimelineOppositeContent sx={{ m: "auto 0" }} color="white">
                    Sep 2024 - December 2024
                </TimelineOppositeContent>
                <TimelineSeparator>
                    <TimelineDot sx={{ backgroundColor: 'rgb(120, 134, 167)' }}>
                    <BuildIcon />
                    </TimelineDot>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                    <RightArrowPaper
                        sx = {{ 
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                            ':hover': {
                            transform: 'scale(1.01)', // Slight zoom-in on hover
                            boxShadow: '0 0 6px 10px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                            }
                        }} 
                    >
                    <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                        Firmware Member | Midnight Sun
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "rgba(200, 210, 230, 255)" }}>
                        Waterloo, ON
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: "8px" }}>
                        - Created a backup driver to ensure data handling during power loss.
                    </Typography>
                    </RightArrowPaper>
                </TimelineContent>
            </TimelineItem>

            {/* Item 3 */}
            <TimelineItem>
                <TimelineOppositeContent sx={{ m: "auto 0" }} color = "white">
                Feb 2023 - Aug 2024
                </TimelineOppositeContent>
                <TimelineSeparator>
                <TimelineDot sx={{ backgroundColor: 'rgb(120, 134, 167)'}}>
                    <WorkIcon />
                </TimelineDot>
                <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                <CustomPaper 
                    sx = {{ 
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                        ':hover': {
                        transform: 'scale(1.01)', // Slight zoom-in on hover
                        boxShadow: '0 0 6px 10px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                        }
                    }} 
                >
                    <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                    Automation Developer | Skynet Security System
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "rgba(200, 210, 230, 255)" }}>
                    Vancouver, BC
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: "8px" }}>
                    - automating workflows with Python scripts.
                    </Typography>
                </CustomPaper>
                </TimelineContent>
            </TimelineItem>

            <TimelineItem>
                <TimelineOppositeContent sx={{ m: "auto 0" }} color="white">
                    Sep 2024 - December 2024
                </TimelineOppositeContent>
                <TimelineSeparator>
                    <TimelineDot sx={{ backgroundColor: 'rgb(120, 134, 167)' }}>
                    <BuildIcon />
                    </TimelineDot>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: "12px", px: 2 }}>
                    <RightArrowPaper
                        sx = {{ 
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                            ':hover': {
                            transform: 'scale(1.01)', // Slight zoom-in on hover
                            boxShadow: '0 0 6px 10px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                            }
                        }} 
                    >
                    <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                        Engineering Instructor | Simon Fraser University (SFU) Camps
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "rgba(200, 210, 230, 255)" }}>
                        Vancouver, BC
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: "8px" }}>
                        - taught children aerodynamics and a bunch of leadership stuffs...
                    </Typography>
                    </RightArrowPaper>
                </TimelineContent>
            </TimelineItem>
        </Timeline>
        
        

    </section>
  );
};

export default TimeLine;
