import React, { useEffect } from "react";
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
import SettingsIcon from "@mui/icons-material/Settings";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolIcon from "@mui/icons-material/School";
import { Card, For } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mui/material";
import Contacts from "../components/contacts";

const Experience = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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
    textAlign: "left",

    "@media (max-width: 2000px)": {
      width: "90%",
    },

    "@media (max-width: 10000px)": {
      maxWidth: "800px",
    },
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
      <section
        className="timeline"
        style={{ paddingTop: "80px", backgroundColor: "#161D25" }}
      >
        <motion.div
          initial={{ x: 0, opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.8 }}
        >
          <h1
            style={{
              textAlign: "center",
              color: "rgb(231, 232, 229)",
              fontWeight: "bold",
            }}
          >
            Experience
          </h1>
        </motion.div>

        {/* TIMELINE */}
        <Timeline
          position={timelinePosition}
          sx={{
            "@media (max-width: 1000px)": {
              left: "0",
              width: "100%",
            },
          }}
        >
          {/* ITEM 1 */}
          <TimelineItem
            sx={{
              width: "100%",
              margin: "0",
              padding: "0px",
            }}
          >
            {/* Date on the left for LARGE screens */}
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                color: "rgba(255, 255, 255, 0.94)",
                "@media (max-width: 1000px)": {
                  display: "none", // Hide the date on smaller screens
                },
              }}
            >
              Jan 2025 - present
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot sx={{ backgroundColor: "rgb(120, 134, 167)" }}>
                <LaptopMacIcon />
              </TimelineDot>
              <TimelineConnector />
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
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    ":hover": {
                      transform: "scale(1.01)",
                      boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                    },
                    "@media (max-width: 1000px)": {
                      width: "100%",
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

                  {/* LOCATION ONLY for LARGE SCREENS */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontStyle: "italic",
                      color: "rgba(200, 210, 230, 255)",
                      "@media (max-width: 1000px)": {
                        display: "none", // Hide location-only text on small screens
                      },
                    }}
                  >
                    Markham, ON
                  </Typography>

                  {/* LOCATION + DATE for SMALL SCREENS */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontStyle: "italic",
                      color: "rgba(200, 210, 230, 255)",
                      "@media (min-width: 1000px)": {
                        display: "none", // Hide combined text on large screens
                      },
                    }}
                  >
                    Markham, ON | Jan 2025 - present
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      marginTop: "8px",
                      width: "100%",
                    }}
                  >
                    - Processed 1.48M+ customer query records using SQL and
                    Python, applying embeddings and clustering to train a Rasa
                    chatbot, automating request categorization and cutting
                    manual work by 80%
                    <br />
                    - Engineered an autonomous robot control system using
                    Python, React, and Flask, integrating 15+ Robot endpoints to
                    support real-time navigation and stock retrieval for over
                    50,000+ warehouse items
                    <br />- Developing HongMall's first e-commerce web
                    application using Angular and TypeScript, supporting a
                    growing mobile user base of 1M+ customers
                  </Typography>
                </CustomPaper>
              </motion.div>
            </TimelineContent>
          </TimelineItem>

          {/* ITEM 1 */}
          <TimelineItem
            sx={{
              width: "100%",
              margin: "0",
              padding: "0px",
            }}
          >
            {/* Date on the left for LARGE screens */}
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                color: "rgba(255, 255, 255, 0.94)",
                "@media (max-width: 1000px)": {
                  display: "none", // Hide the date on smaller screens
                },
              }}
            >
              Jan 2025 - Apr 2025
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot sx={{ backgroundColor: "rgb(120, 134, 167)" }}>
                <SettingsIcon />
              </TimelineDot>
              <TimelineConnector />
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
                {isLargeScreen ? (
                  <RightArrowPaper
                    sx={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ":hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                      },
                      "@media (max-width: 1000px)": {
                        width: "100%",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{ fontWeight: "bold" }}
                    >
                      Automation Developer | Pacific Grace Mandarin Church
                      (PGMC)
                    </Typography>

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none", // Hide location-only text on small screens
                        },
                      }}
                    >
                      Remote - Vancouver, BC
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none", // Hide combined text on large screens
                        },
                      }}
                    >
                      Remote - Vancouver, BC | Jan 2025 - Apr 2025
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        marginTop: "8px",
                        width: "100%",
                      }}
                    >
                      - Developed and deployed a Python-based Discord bot using
                      Docker, automating daily Bible readings and announcements
                      for a 105+ member community, streamlining communication by
                      over 80%
                      <br />- Integrated Google Sheets API for real-time updates
                      and hosted on Google Cloud Run for scalability
                    </Typography>
                  </RightArrowPaper>
                ) : (
                  <CustomPaper
                    sx={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ":hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                      },
                      "@media (max-width: 1000px)": {
                        width: "100%",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{ fontWeight: "bold" }}
                    >
                      Automation Developer | Pacific Grace Mandarin Church
                      (PGMC)
                    </Typography>

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none", // Hide location-only text on small screens
                        },
                      }}
                    >
                      Markham, ON
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none", // Hide combined text on large screens
                        },
                      }}
                    >
                      Remote - Vancouver, BC | Nov 2024 - Mar 2025
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        marginTop: "8px",
                        width: "100%",
                      }}
                    >
                      - Developed and deployed a Python-based Discord bot using
                      Docker, automating daily Bible readings and announcements
                      for a 105+ member community, streamlining communication by
                      over 80%
                      <br />- Integrated Google Sheets API for real-time updates
                      and hosted on Google Cloud Run for scalability
                    </Typography>
                  </CustomPaper>
                )}
              </motion.div>
            </TimelineContent>
          </TimelineItem>

          {/* ITEM 2 */}
          <TimelineItem>
            {/* Date on the left for LARGE screens */}
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                "@media (max-width: 1000px)": {
                  display: "none", // Hide the date on smaller screens
                },
              }}
              color="white"
            >
              Sep 2024 - Dec 2024
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot sx={{ backgroundColor: "rgb(120, 134, 167)" }}>
                <ElectricBoltIcon />
              </TimelineDot>
              <TimelineConnector />
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
                {isLargeScreen ? (
                  <CustomPaper
                    sx={{
                      "@media (max-width: 1000px)": {
                        width: "100%",
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

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Waterloo, ON
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Waterloo, ON | Sep 2024 - Dec 2024
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ marginTop: "8px", width: "100%" }}
                    >
                      - Created a backup driver using C to integrate STM32's
                      Backup registers, ensuring access control during power
                      loss
                      <br />- Implemented an ADC driver with C firmware and I2C
                      communication to convert temperature to voltage
                    </Typography>
                  </CustomPaper>
                ) : (
                  <CustomPaper
                    sx={{
                      "@media (max-width: 1000px)": {
                        width: "100%",
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

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Waterloo, ON
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Waterloo, ON | Sep 2024 - Dec 2024
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ marginTop: "8px", width: "100%" }}
                    >
                      - Created a backup driver using C to integrate STM32's
                      Backup registers, ensuring access control during power
                      loss
                      <br />- Implemented an ADC driver with C firmware and I2C
                      communication to convert temperature to voltage
                    </Typography>
                  </CustomPaper>
                )}
              </motion.div>
            </TimelineContent>
          </TimelineItem>

          {/* ITEM 3 */}
          <TimelineItem>
            {/* Date on the left for LARGE screens */}
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
              <TimelineDot sx={{ backgroundColor: "rgb(120, 134, 167)" }}>
                <SecurityIcon />
              </TimelineDot>
              <TimelineConnector />
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
                {isLargeScreen ? (
                  <RightArrowPaper
                    sx={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ":hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                      },
                      "@media (max-width: 1000px)": {
                        width: "100%",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{ fontWeight: "bold" }}
                    >
                      Software Engineering Intern | Skynet Security System Ltd.
                    </Typography>

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC | Feb 2023 - Aug 2024
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ marginTop: "8px", width: "100%" }}
                    >
                      - Developed a multiprocessing Python script for CSV
                      normalization, increasing workflow speed by 40%
                      <br />
                      - Designed and built a cross-platform invoice system with
                      Python, Tkinter, and ReportLab, automating billing for 50+
                      clients and reducing invoice preparation time by 75%
                      <br />- Developed the company's website and advertisements
                      using React, TypeScript, and Figma, which contributed to
                      36% of client job bookings, generating $72,000+ in revenue
                      in 2023
                    </Typography>
                  </RightArrowPaper>
                ) : (
                  <CustomPaper
                    sx={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ":hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                      },
                      "@media (max-width: 1000px)": {
                        width: "100%",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{ fontWeight: "bold" }}
                    >
                      Software Engineering Intern | Skynet Security System Ltd.
                    </Typography>

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC | Feb 2023 - Aug 2024
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ marginTop: "8px", width: "100%" }}
                    >
                      - Developed a multiprocessing Python script for CSV
                      normalization, increasing workflow speed by 40%
                      <br />
                      - Designed and built a cross-platform invoice system with
                      Python, Tkinter, and ReportLab, automating billing for 50+
                      clients and reducing invoice preparation time by 75%
                      <br />- Developed the company's website and advertisements
                      using React, TypeScript, and Figma, which contributed to
                      36% of client job bookings, generating $72,000+ in revenue
                      in 2023
                    </Typography>
                  </CustomPaper>
                )}
              </motion.div>
            </TimelineContent>
          </TimelineItem>

          {/* ITEM 4 */}
          <TimelineItem>
            {/* Date on the left for LARGE screens */}
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                "@media (max-width: 1000px)": {
                  display: "none", // Hide date on smaller screens
                },
              }}
              color="white"
            >
              Jul 2024 - Aug 2024
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot sx={{ backgroundColor: "rgb(120, 134, 167)" }}>
                <SchoolIcon />
              </TimelineDot>
              {/* No connector here, but you can add if needed */}
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
                {isLargeScreen ? (
                  <CustomPaper
                    sx={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ":hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                      },
                      "@media (max-width: 1000px)": {
                        width: "100%",
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
                      Engineering Instructor | Simon Fraser University (SFU)
                      Camps
                    </Typography>

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC | Sep 2024 - Dec 2024
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        marginTop: "8px",
                        width: "100%",
                      }}
                    >
                      - Collaborated with staff to oversee STEM lessons and
                      icebreakers
                      <br />- Constructed a curriculum on Aerodynamics for 20+
                      youth aerodynamics
                    </Typography>
                  </CustomPaper>
                ) : (
                  <CustomPaper
                    sx={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ":hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 0 6px 10px rgba(147, 143, 143, 0.5)",
                      },
                      "@media (max-width: 1000px)": {
                        width: "100%",
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
                      Engineering Instructor | Simon Fraser University (SFU)
                      Camps
                    </Typography>

                    {/* LOCATION ONLY for LARGE SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (max-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC
                    </Typography>

                    {/* LOCATION + DATE for SMALL SCREENS */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontStyle: "italic",
                        color: "rgba(200, 210, 230, 255)",
                        "@media (min-width: 1000px)": {
                          display: "none",
                        },
                      }}
                    >
                      Vancouver, BC | Sep 2024 - Dec 2024
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        marginTop: "8px",
                        width: "100%",
                      }}
                    >
                      - Collaborated with staff to oversee STEM lessons and
                      icebreakers
                      <br />- Constructed a curriculum on Aerodynamics for 20+
                      youth aerodynamics
                    </Typography>
                  </CustomPaper>
                )}
              </motion.div>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </section>

      <Contacts />
    </>
  );
};

export default Experience;
