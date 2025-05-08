import { useState } from 'react';
import { Badge, Box, Button, HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

// Sample project data structure
const projectsData = [
  {
    id: 1,
    title: "UW MarketPlace",
    description: "Building a platform to help students buy and sell used items on campus.",
    image: "/images/projects/Blank.svg",
    tags: ["Python", "Typescript", "React", "Gemini API", "PostgreSQL"],
    link: "https://github.com/yanxue06/harmoniq",
    status: "coming soon"
  },
  {
    id: 2,
    title: "Drug Sensescence Forecasting",
    description: "This project explores the lifespan extension potential of chemical compounds using machine learning. Under the mentorship of Dr. Michał Koziarski, we are developing predictive models to assess compounds' effects on longevity.",
    image: "/images/projects/drugforecast.svg",
    tags: ["Python", "Pandas", "Scikit-learn", "Matplotlib", "Seaborn"],
    link: "https://github.com/yanxue06/ML-Age"
  },
  {
    id: 3,
    title: "JobBot",
    description: "Job Scraper with AI integration for increasing the efficiency of the job search process. It scrapes websites for key details then uses LLama to summarize the posting. The application then saves all scraped data into an Excel file.",
    image: "/images/projects/JobBot.svg",
    tags: ["Python", "Selenium", "Pandas", "Llama", "React"],
    link: "https://github.com/yanxue06/jobbot"
  },
  {
    id: 4,
    title: "PowerPrompt",
    description: "Raising Awareness: PowerPrompt gives users real-time feedback on the energy consumption of their ChatGPT interactions. Our friendly monkey mascot 🐒 updates users on their energy usage, token count, and carbon footprint—helping them see the environmental impact of their conversations.",
    image: "/images/projects/Powerprompt.svg",
    tags: ["React", "JavaScript", "Chrome Storage API", "Vite"],
    link: "https://github.com/yanxue06/Powerprompt"
  },
  {
    id: 5,
    title: "Comparisum",
    description: "Comparisum is a platform that summarizes chunks of amazon reviews for products. It provides top pros and cons, considering number of helpful votes and overall rating, ensuring that users can make informed decision purchases.",
    image: "/images/projects/Comparisum.svg",
    tags: ["Python", "Llama", "AWS", "React", "SQL"],
    link: "https://github.com/geashley/watAI"
  },
  {
    id: 6,
    title: "Misc - Computer Vision",
    description: "A collection of random computer vision projects I've worked on. As of now, this includes face and hand trackers.",
    image: "/images/projects/Blank.svg",
    tags: ["OpenCV", "MediaPipe", "Pandas"],
    link: "https://github.com/yanxue06/ComputerVision-Collection"
  },
  {
    id: 7,
    title: "House Price Predictor",
    description: "Tested various regression models (linear and forest) to accurately predict housing prices given various deciding factors. Using random forest regression, the model predicted housing prices with a 81.54% percent accuracy",
    image: "/images/projects/Housing.svg",
    tags: ["Python", "NumPy", "Pandas", "Sckit-learn"],
    link: "https://github.com/yanxue06/Housing-Price-Predictor"
  },
  {
    id: 8,
    title: "CSV Data Normalizer",
    description: "This program leverages multiprocessing to efficiently normalize CSV data, including phone numbers and dates. It also uses a tkinter user interface.",
    image: "/images/projects/CSV.svg",
    tags: ["OpenCV", "MediaPipe", "Pandas"],
    link: "https://github.com/yanxue06/CSV_Normalization"
  },
  {
    id: 9,
    title: "RFID Card Swipe",
    description: "A simple Java-based system that emulates RFID card swipes using a GUI. Users can input their RFID tag, name, and other details, which are stored in a text file. The system allows creating, updating, viewing, and deleting user information through a straightforward interface.",
    image: "/images/projects/RFID.svg",
    tags: ["Python", "PostgreSQL", "React", "JavaScript", "HTML"],
    link: "https://github.com/yanxue06/rfid-card-swipe"
  },
  {
    id: 10,
    title: "LinkCom",
    description: "LinkCom serves the purpose of bridging the communication troubles between the hard of hearing and society. This project implements a bidirectional communication system using STM32 microcontrollers, an LCD, a keypad, and GPIO signals. The system enables users to send and receive predefined messages through a simple interface.",
    image: "/images/projects/LinkCom.png",
    tags: ["STM32", "C"],
    link: "https://github.com/yanxue06/LinkCom"
  },
  {
    id: 11,
    title: "Trackify",
    description: "Trackify is designed for users to manage, visualize, and improve their spending habits. It includes login, registration, and full CRUD functionality for expense tracking. I created this app appealing to its ability for visually spending through more than just numbers, but also extending to graphs.",
    image: "/images/projects/Trackify.svg",
    tags: ["Python", "PostgreSQL", "Django", "JavaScript", "BootStrap"],
    link: "https://github.com/yanxue06/Portfolio"
  },
  {
    id: 12,
    title: "Portfolio",
    description: "This portfolio was one of my first projects with React. From the designing on Figma and then translating everything to code, the whole process was so fun!",
    image: "/images/projects/Portfolio.svg",
    tags: ["React", "HTML", "CSS", "JavaScript", "Figma"],
    link: "https://github.com/yanxue06/Portfolio"
  }
];

// Single project card component
const ProjectCard = ({ project }) => {
  return (
    <motion.div
      initial={{ x: 0, opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      className="project-card"
    >
      <Box
        display="flex"
        flexDirection="column"
        maxW="900px"
        mx="auto"
        overflow="hidden"
        borderRadius="xl"
        boxShadow="lg"
        bg="black"
        h="auto"
        width="80%"
        transition="transform 0.3s ease, box-shadow 0.3s ease"
        _hover={{
          transform: "scale(1.02)",
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)"
        }}
      >
        <Box
          w="100%"
          bg="black"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <LazyLoadImage
            src={project.image}
            alt={project.title}
            effect="blur"
            width="100%"
            height="100%"
            style={{
              objectFit: "contain",
              objectPosition: "center",
              display: "block"
            }}
          />
        </Box>

        <Box
          p={6}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          w="100%"
        >
          <Box>
            <Box
              mb={2}
              fontSize="2xl"
              fontWeight="bold"
              color="white"
            >
              {project.title} {project.status && `(${project.status})`}
            </Box>
            <Box
              fontSize="lg"
              lineHeight="tall"
              color="gray.300"
              width="100%"
            >
              {project.description}
            </Box>

            <HStack mt={4} spacing={3} flexWrap="wrap">
              {project.tags.map((tag, index) => (
                <Badge key={index} colorScheme="teal" fontSize="sm">
                  {tag}
                </Badge>
              ))}
            </HStack>
          </Box>

          <Button
            variant="solid"
            bg="white"
            color="black"
            fontSize="sm"
            width="40%"
            marginTop="20px"
            _hover={{ bg: "gray.300" }}
            as="a"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-button"
          >
            See The Code
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

// Main ProjectBox component - displays all projects
const ProjectBox = () => {
  const [filter, setFilter] = useState('');
  const filteredProjects = filter ? 
    projectsData.filter(project => 
      project.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())) ||
      project.title.toLowerCase().includes(filter.toLowerCase())
    ) : 
    projectsData;

  return (
    <section id="projects" className="p3">
      {/* <div className="filter-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Filter projects by technology or name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid #444',
            background: '#111',
            color: 'white',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div> */}
      
      <div className="projectsCol">
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
            No projects match your filter criteria.
          </div>
        ) : (
          <>
            {/* Display projects in rows of 2 */}
            {Array(Math.ceil(filteredProjects.length / 2)).fill().map((_, rowIndex) => (
              <div className="projectsRow" key={rowIndex}>
                {filteredProjects.slice(rowIndex * 2, rowIndex * 2 + 2).map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default ProjectBox;