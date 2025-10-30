import React from 'react';
import { motion } from "framer-motion";
import { Box, Card, Badge, HStack } from "@chakra-ui/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';

// Project data - only non-commented projects
const projectsData = [
  {
    title: "Drug Sensescence Forecasting",
    description: "This project explores the lifespan extension potential of chemical compounds using machine learning. Under the mentorship of Dr. Michał Koziarski, we are developing predictive models to assess compounds' effects on longevity.",
    image: "/images/projects/drugforecast.png",
    tags: ["Python", "Pandas", "Scikit-learn", "Matplotlib", "Seaborn"],
    link: "https://github.com/yanxue06/ML-Age",
  },
  {
    title: "JobBot",
    description: "Job Scraper with AI integration for increasing the efficiency of the job search process. It scrapes websites for key details then uses LLama to summarize the posting. The application then saves all scraped data into an Excel file.",
    image: "/images/projects/jobbot.png",
    tags: ["Python", "Selenium", "Pandas", "Llama", "React"],
    link: "https://github.com/yanxue06/jobbot",
  },
  {
    title: "Comparisum",
    description: "Comparisum is a platform that summarizes chunks of amazon reviews for products. It provides top pros and cons, considering number of helpful votes and overall rating, ensuring that users can make informed decision purchases.",
    image: "/images/projects/comparisum.png",
    tags: ["Python", "Llama", "AWS", "React", "SQL"],
    link: "https://github.com/geashley/watAI",
  },
  {
    title: "LinkCom",
    description: "LinkCom serves the purpose of bridging the communication troubles between the hard of hearing and society. This project implements a bidirectional communication system using STM32 microcontrollers, an LCD, a keypad, and GPIO signals. The system enables users to send and receive predefined messages through a simple interface.",
    image: "/images/projects/LinkCom.png",
    tags: ["STM32", "C"],
    link: "https://github.com/yanxue06/LinkCom.png",
  },
  {    
    title: "Portfolio",
    description: "This portfolio was one of my first projects with React. From the designing on Figma and then translating everything to code, the whole process was so fun!",
    image: "/images/projects/portfolio.png",
    tags: ["React", "HTML", "CSS", "JavaScript", "Figma"],
    link: "https://github.com/yanxue06/portfolio.png",
  }
];

// Blue color palette with more visible variations
const accentColors = [
  "#4A9FE8", // Deep blue
  "#5CB5FF", // Bright blue  
  "#70C5FF", // Sky blue
  "#85D5FF", // Light sky blue
  "#9AE0FF", // Pale blue
];

// Single project card component
const ProjectCard = ({ project, index }) => {
  const colorAccent = accentColors[index % accentColors.length];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto"
      }}
    >
      <Card.Root
        css={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.35),
            0 2px 8px rgba(0,0,0,0.25),
            inset 0 1px 1px rgba(255,255,255,0.3),
            inset 0 -1px 1px rgba(0,0,0,0.2)
          `,

          // Liquid glass shimmer effect with more visible tinting
          "&::before": {
            content: "''",
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              radial-gradient(800px 350px at -10% -15%, ${colorAccent}50 0%, transparent 50%),
              radial-gradient(600px 300px at 110% 110%, rgba(255,255,255,0.18) 0%, transparent 50%),
              linear-gradient(135deg, transparent 0%, ${colorAccent}15 30%, transparent 70%)
            `,
            opacity: 1,
          },
          
          // Top glass reflection
          "&::after": {
            content: "''",
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)",
            opacity: 0.8,
            pointerEvents: "none",
            borderRadius: "50%",
          },

          // Hover effects with smooth transitions
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s ease",
          "&:hover": {
            transform: "translateY(-12px) scale(1.02)",
            borderColor: `${colorAccent}60`,
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.45),
              0 8px 20px rgba(0,0,0,0.3),
              0 0 0 1px ${colorAccent}80,
              inset 0 0 40px ${colorAccent}20,
              inset 0 2px 2px rgba(255,255,255,0.4)
            `,
          },

          // Fallback when backdrop-filter isn't supported
          "@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))": {
            background: "rgba(15, 23, 42, 0.9)",
          },
        }}
      >
        {/* Project Image */}
        <Box
          css={{
            width: "100%",
            height: "280px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <LazyLoadImage
            src={project.image}
            alt={project.title}
            effect="blur"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </Box>

        <Card.Body 
          css={{
            padding: "32px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          {/* Project Title */}
          <Box>
            <h3
              style={{
                fontSize: "1.45rem",
                fontWeight: "700",
                color: "white",
                marginBottom: "8px",
                lineHeight: "1.3",
              }}
            >
              {project.title}
            </h3>
            
           
          </Box>

          {/* Description */}
          <Box
            css={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "1.05rem",
              lineHeight: "1.6",
              flex: 1,
            }}
          >
            {project.description}
          </Box>

          {/* Tech Tags */}
          <Box
            css={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "auto",
            }}
          >
            {project.tags.map((tag, idx) => (
              <Badge
                key={idx}
                css={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.9rem",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {tag}
              </Badge>
            ))}
          </Box>

          {/* Action Buttons */}
          <Box
            css={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: colorAccent,
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.color = "#ffffff"}
              onMouseLeave={(e) => e.target.style.color = colorAccent}
            >
              <GitHubIcon style={{ fontSize: "1.2rem" }} />
              View Code
            </a>
            
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "rgba(255, 255, 255, 0.6)",
                textDecoration: "none",
                fontSize: "0.8rem",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.color = "#ffffff"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}
            >
              <LaunchIcon style={{ fontSize: "1rem" }} />
            </a>
          </Box>
        </Card.Body>
      </Card.Root>
    </motion.div>
  );
};

// Main Projects component
const ProjectBox = () => {
  return (
    <section 
      id="projects" 
      style={{ 
        width: "100%", 
        padding: "80px 0",
        background: "rgba(6, 11, 17, 0.3)"
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ 
          textAlign: "center", 
          marginBottom: "60px",
          maxWidth: "800px",
          margin: "0 auto 60px auto",
          padding: "0 20px"
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 2.8rem)",
            fontWeight: "bold",
            color: "rgb(196, 223, 235)",
            marginBottom: "16px",
          }}
        >
          My <span style={{
                background: "linear-gradient(90deg, #63d0f8, #65b5ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Projects</span>
        </h1>
      </motion.div>

      {/* Projects Grid */}
      <Box
        css={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "40px",
          
          "@media (max-width: 768px)": {
            gridTemplateColumns: "1fr",
            gap: "32px",
            padding: "0 16px",
          },
          
          "@media (max-width: 480px)": {
            padding: "0 12px",
          },
        }}
      >
        {projectsData.map((project, index) => (
          <ProjectCard key={index} project={project} index={index} />
        ))}
      </Box>
    </section>
  );
};

export default ProjectBox;
