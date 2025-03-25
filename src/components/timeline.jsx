import React from "react";
import { motion } from "framer-motion";
import { Box, Button, Card, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const experiences = [
  {
    title: "Software Engineering Intern",
    company: "HongMall",
    period: "Jan 2025 - present",
    location: "Markham, ON",
    brief: "Developing e-commerce solutions and automation systems serving 1M+ customers"
  },
  {
    title: "Automation Developer",
    company: "Pacific Grace Mandarin Church",
    period: "Jan 2025 - Apr 2025",
    location: "Remote - Vancouver, BC",
    brief: "Built automation tools improving communication efficiency by 80% for 105+ members"
  },
  {
    title: "Firmware Member",
    company: "Midnight Sun",
    period: "Sep 2024 - Dec 2024",
    location: "Waterloo, ON",
    brief: "Developed C firmware for STM32 microcontrollers and implemented ADC drivers"
  },
  {
    title: "Software Engineering Intern",
    company: "Skynet Security System Ltd.",
    period: "Feb 2023 - Aug 2024",
    location: "Vancouver, BC",
    brief: "Led development of automation tools and web platforms generating $72,000+ in revenue"
  }
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
            borderRadius: "8px",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
            },
            "@media (max-width: 780px)": {
              width: "90%",
            },
          }}
        >
          <Card.Body>
            <Card.Title
              mb="4"
              css={{
                fontSize: "clamp(24px, 3vw, 28px)",
                fontWeight: "bold",
                color: "white",
              }}
            >
              Experience
            </Card.Title>
            
            <Box css={{ marginBottom: "24px" }}>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                style={{ 
                  "--swiper-navigation-color": "#fff",
                  "--swiper-pagination-color": "#fff",
                }}
              >
                {experiences.map((exp, index) => (
                  <SwiperSlide key={index}>
                    <Box
                      css={{
                        padding: "20px",
                        backgroundColor: "#1e2f3e",
                        borderRadius: "8px",
                        border: "1px solid rgba(235, 235, 235, 0.1)",
                      }}
                    >
                      <h3 style={{ 
                        fontSize: "1.25rem", 
                        fontWeight: "bold",
                        color: "rgb(220, 229, 251)",
                        marginBottom: "8px"
                      }}>
                        {exp.title}
                      </h3>
                      <p style={{ 
                        color: "rgb(220, 229, 251)",
                        opacity: 0.9,
                        fontSize: "1rem",
                        marginBottom: "4px"
                      }}>
                        {exp.company}
                      </p>
                      <p style={{ 
                        color: "rgb(220, 229, 251)",
                        opacity: 0.7,
                        fontSize: "0.9rem",
                        marginBottom: "12px"
                      }}>
                        {exp.period} | {exp.location}
                      </p>
                      <p style={{ 
                        color: "rgb(220, 229, 251)",
                        fontSize: "0.95rem",
                        lineHeight: "1.5"
                      }}>
                        {exp.brief}
                      </p>
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>

            <Button
              as={Link}
              to="/experience"
              css={{
                backgroundColor: "#66789F",
                color: "rgb(220, 229, 251)",
                padding: "12px 24px",
                borderRadius: "8px",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(141, 140, 178, 0.79)",
                },
              }}
            >
              View Full Timeline ›
            </Button>
          </Card.Body>
        </Card.Root>
      </motion.div>
    </section>
  );
};

export default TimeLine;