import React from "react";
import { motion } from "framer-motion";
import { Box, Button, Card } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ArrowRight } from "lucide-react";

// Default company logos - replace with actual logos later
const logoPlaceholders = {
  "HongMall": "/images/logo-placeholder1.svg",
  "Pacific Grace Mandarin Church": "/images/logo-placeholder2.svg",
  "Midnight Sun": "/images/logo-placeholder3.svg",
  "Skynet Security System Ltd.": "/images/logo-placeholder4.svg", 
  "Rocketry": "/images/logo-placeholder5.svg",
};

const experiences = [
  {
    title: "Software Developer",
    company: "Rocketry",
    period: "Mar 2025 - Present",
    location: "Waterloo, ON",
    brief: "ROCKETS!",
    logoPath: logoPlaceholders["Rocketry"],
    colorAccent: "#65B5FF"
  },
  {
    title: "Software Engineering Intern",
    company: "HongMall",
    period: "Jan 2025 - present",
    location: "Markham, ON",
    brief: "Developing e-commerce solutions and automation systems serving 1M+ customers",
    logoPath: logoPlaceholders["HongMall"],
    colorAccent: "#FF5A6E"
  },
  {
    title: "Automation Developer",
    company: "Pacific Grace Mandarin Church",
    period: "Jan 2025 - Apr 2025",
    location: "Remote - Vancouver, BC",
    brief: "Built automation tools improving communication efficiency by 80% for 105+ members",
    logoPath: logoPlaceholders["Pacific Grace Mandarin Church"],
    colorAccent: "#65B5FF"
  },
  {
    title: "Firmware Member",
    company: "Midnight Sun",
    period: "Sep 2024 - Dec 2024",
    location: "Waterloo, ON",
    brief: "Developed C firmware for STM32 microcontrollers and implemented ADC drivers",
    logoPath: logoPlaceholders["Midnight Sun"],
    colorAccent: "#FFA94D"
  },
  {
    title: "Software Engineering Intern",
    company: "Skynet Security System Ltd.",
    period: "Feb 2023 - Aug 2024",
    location: "Vancouver, BC",
    brief: "Led development of automation tools and web platforms generating $72,000+ in revenue",
    logoPath: logoPlaceholders["Skynet Security System Ltd."],
    colorAccent: "#4CAF50"
  },
  
 
];

const TimeLine = () => {
  return (
    <section style={{ width: "100%" }}>
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
            padding: "32px",
            paddingBottom: "45px", // Extra padding for navigation arrows
            borderRadius: "8px",
            position: "relative",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
            },
            "@media (max-width: 780px)": {
              width: "90%",
              padding: "16px",
              paddingBottom: "40px",
            },
          }}
        >
          <Card.Title
            mb="2"
            css={{
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Experience
          </Card.Title>
          <Card.Description
            css={{
              color: "rgb(220, 229, 251)",
              width: "90%",
              fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
              lineHeight: "1.4",
              maxWidth: "100%",
              marginBottom: "24px",
              "@media (max-width: 780px)": {
                fontSize: "0.9rem"
              }
            }}
          >
            Places I've worked and projects I've contributed to throughout my career.
          </Card.Description>
          
          {/* Add fixed width container for the Swiper */}
          <div style={{ width: "100%", position: "relative" }}>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              initialSlide={0}
              slidesPerView={3} 
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
                enabled: true,
              }}
              pagination={{ 
                clickable: true,
                el: '.swiper-pagination'
              }}
              loop={true}
              autoplay={{ 
                delay: 3000,
                disableOnInteraction: false
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                600: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                900: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                }
              }}
              style={{ 
                "--swiper-navigation-color": "#fff",
                "--swiper-pagination-color": "#fff",
                padding: "10px 30px", // Padding for navigation arrows
                margin: "0 -10px", // Compensate for the padding
              }}
            >
              {experiences.map((exp, index) => (
                <SwiperSlide key={index}>
                  <Box
                    css={{
                      backgroundColor: "#1e2f3e",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid rgba(235, 235, 235, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      height: "320px", // Fixed height
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    <Box 
                      css={{
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <Box 
                        css={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <Box 
                          css={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            background: "#0B131E",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "10px",
                            border: "1px solid rgba(235, 235, 235, 0.2)",
                            overflow: "hidden",
                          }}
                        >
                          <img 
                            src={exp.logoPath} 
                            alt={`${exp.company} logo`} 
                            style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                          />
                        </Box>
                        <Box css={{ flex: 1, overflow: "hidden" }}>
                          <h3 style={{ 
                            fontSize: "1rem", 
                            fontWeight: "bold",
                            color: exp.colorAccent,
                            marginBottom: "2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {exp.title}
                          </h3>
                          <p style={{ 
                            color: "rgb(220, 229, 251)",
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {exp.company}
                          </p>
                        </Box>
                      </Box>
                      
                      <p style={{ 
                        color: "rgb(220, 229, 251)",
                        opacity: 0.7,
                        fontSize: "0.8rem",
                        marginBottom: "8px",
                        width: "95%", 
                      }}>
                        {exp.period} 
                        <br />
                        {exp.location}
                      </p>
                      
                      <p style={{ 
                        color: "rgb(220, 229, 251)",
                        fontSize: "0.85rem",
                        lineHeight: "1.4",
                        marginBottom: "16px",
                        flex: "1",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: "4",
                        WebkitBoxOrient: "vertical",
                      }}>
                        {exp.brief}
                      </p>
                      
                      <Box 
                        css={{
                          marginTop: "auto",
                        }}
                      >
                        <Button
                          as={Link}
                          to="/experience"
                          css={{
                            width: "100%",
                            justifyContent: "space-between",
                            backgroundColor: "#66789F",
                            color: "rgb(220, 229, 251)",
                            padding: "8px 12px",
                            fontSize: "0.85rem",
                            borderRadius: "6px",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor: "rgba(141, 140, 178, 0.79)",
                            },
                          }}
                        >
                          View details
                          <ArrowRight size={14} style={{ marginLeft: "6px" }} />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
              {/* Navigation arrows outside of slides */}
              <div className="swiper-button-prev" style={{ 
                color: "white", 
                left: "0px",
                transform: "scale(0.8)",
                opacity: "0.9",
                background: "rgba(0,0,0,0.3)",
                padding: "30px 20px",
                borderRadius: "0 5px 5px 0",
              }}></div>
              <div className="swiper-button-next" style={{ 
                color: "white", 
                right: "0px",
                transform: "scale(0.8)",
                opacity: "0.9",
                background: "rgba(0,0,0,0.3)",
                padding: "30px 20px",
                borderRadius: "5px 0 0 5px",
              }}></div>
            </Swiper>
            {/* Pagination dots below swiper */}
            <div className="swiper-pagination" style={{ 
              bottom: "-25px",
              position: "absolute",
              width: "100%",
              textAlign: "center",
            }}></div>
          </div>
        </Card.Root>
      </motion.div>
    </section>
  );
};

export default TimeLine;