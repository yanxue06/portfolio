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
import { Card, Heading, Stack } from "@chakra-ui/react"


const CustomPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#3a3b5a", // Purple background
  color: "#E2D9FF", // Soft white text
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

const TimeLine = () => {
  return (
    <section className = "timeline"> 

        <Timeline position="alternate">
        <div id="experience" className="exp_heading">
            Experience
        </div> 

        {/* Item 1 */}
        <TimelineItem>
            <TimelineOppositeContent sx={{ m: "auto 0" }} color="#E2D9FF">
            Jan 2025 - present
            </TimelineOppositeContent>
            <TimelineSeparator>
            <TimelineDot color="primary">
                <LaptopMacIcon />
            </TimelineDot>
            <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
            <CustomPaper>
                <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                Software Engineering Intern | HongMall
                </Typography>
                <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "#C4B4FF" }}>
                Greater Toronto Area, Ontario
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "8px" }}>
                - developign web applications to server over 1,000,000 people 
                </Typography>
            </CustomPaper>
            </TimelineContent>
        </TimelineItem>

        {/* Item 2 */}
        <TimelineItem>
            <TimelineOppositeContent sx={{ m: "auto 0" }} color="#E2D9FF">
            Sep 2024 - December 2024
            </TimelineOppositeContent>
            <TimelineSeparator>
            <TimelineDot color="secondary">
                <BuildIcon />
            </TimelineDot>
            <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
            <CustomPaper>
                <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                Firmware Member | Midnight Sun
                </Typography>
                <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "#C4B4FF" }}>
                Waterloo, ON
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "8px" }}>
                - Created a backup driver to ensure data handling during power loss.
                </Typography>
            </CustomPaper>
            </TimelineContent>
        </TimelineItem>

        {/* Item 3 */}
        <TimelineItem>
            <TimelineOppositeContent sx={{ m: "auto 0" }} color="#E2D9FF">
            Feb 2023 - Aug 2024
            </TimelineOppositeContent>
            <TimelineSeparator>
            <TimelineDot color="secondary" variant="outlined">
                <WorkIcon />
            </TimelineDot>
            <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
            <CustomPaper>
                <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                Automation Developer | Skynet Security System
                </Typography>
                <Typography variant="subtitle2" sx={{ fontStyle: "italic", color: "#C4B4FF" }}>
                Vancouver, BC
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "8px" }}>
                - automating workflows with Python scripts.
                </Typography>
            </CustomPaper>
            </TimelineContent>
        </TimelineItem>
        </Timeline>
    </section>
  );
};

export default TimeLine;
