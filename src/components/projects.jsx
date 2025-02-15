import * as React from "react";
// import Card from "@mui/material/Card";
// import CardActions from "@mui/material/CardActions";
// import CardContent from "@mui/material/CardContent";
// import CardMedia from "@mui/material/CardMedia";
// import Button from "@mui/material/Button";
// import Typography from "@mui/material/Typography";
// import Stack from "@mui/material/Stack";
// import Paper from "@mui/material/Paper";
// import { styled } from "@mui/material/styles";
import "../styles/home.css";
import "../styles/projects.css";
import p3 from "../images/projects/p3.svg";
import p2 from "../images/projects/p2.svg";
import { Badge, Box, Button, Card, HStack, Image, For } from "@chakra-ui/react";
import { motion } from "framer-motion";

export default function Projects() {

    return (
        <section id="projects" className="p3">
                <div className="projectsCol">

                    {/* ROW 1 */}

                    <div className="projectsRow">
                       
                    <motion.div
                        initial={{ x: 0, opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                    > 
                    <Card.Root
                        display="flex"
                        flexDirection="column" // Stack image on top of text
                        maxW="900px"
                        mx="auto"
                        overflow="hidden"
                        borderRadius="xl"
                        boxShadow="lg"
                        bg="black"
                        h="auto"
                        width="80%" // Let the card grow to fit content
                        transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                        css={{
                            "&:hover": {
                                transform: "scale(1.02)", // Gentle zoom effect
                                boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                            }
                        }}
                    >
                        <Box
                            w="100%"
                            bg="black" // Matches the card background
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                        >
                            {/* Image */}
                            <Image
                                src={p2}
                                alt="JobBot"
                                objectFit="contain" // Ensure image covers the entire area
                                w="100%"
                                h="100%" 
                                display="block" // Remove any inline spacing
                            />
                        </Box>

                        {/* Text Section */}
                        <Box
                            p={6}
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            w="100%" // Full width of the card
                        >
                            <Box>
                                <Card.Title
                                    mb={2}
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color="white"
                                >
                                    JobBot
                                </Card.Title>
                                <Card.Description
                                    fontSize="lg"
                                    lineHeight="tall"
                                    color="gray.300"
                                    width="100%"
                                >
                                    Job Scraper with AI integration for tailored
                                    job matching, resume suggesions, and cover
                                    letter generation. The application saves all scraped
                                    key scraped info into an Excel file, so you can keep 
                                    tabs on your applications. 
                                    {/* As a Waterloo Student, I've 
                                    always dreaded the process of reading over hundreds of 
                                    job posting in hopes of a seeking a co-op every 4 
                                    months - this app has allowed me to save both time and keep
                                    track of the applications I've saved!  */}
                                </Card.Description>

                                <HStack mt={4} spacing={3} flexWrap="wrap">
                                    <Badge colorScheme="teal" fontSize="sm">
                                        Python
                                    </Badge>
                                    <Badge colorScheme="purple" fontSize="sm">
                                        Selenium
                                    </Badge>
                                    <Badge colorScheme="blue" fontSize="sm">
                                        Pandas
                                    </Badge>
                                    <Badge colorScheme="orange" fontSize="sm">
                                        OpenAI
                                    </Badge>
                                    <Badge colorScheme="red" fontSize="sm">
                                        React
                                    </Badge>
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
                                href="https://github.com/yanxue06/jobbot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-button"
                            >
                                See The Code
                            </Button>
                        </Box>
                    </Card.Root>
                    </motion.div>

                     <motion.div
                            initial={{ x: 0, opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                        > 
                        <Card.Root
                            display="flex"
                            flexDirection="column" // Stack image on top of text
                            maxW="900px"
                            boxShadow="lg"
                            bg="black"
                            mx="auto"
                            overflow="hidden"
                            borderRadius="xl"
                            h="auto"
                            width="80%" // Let the card grow to fit content
                            transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                            css={{
                                "&:hover": {
                                    transform: "scale(1.02)", // Gentle zoom effect
                                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                }
                            }}
                        >
                            <Box
                                w="100%"
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Image
                                    src={p3}
                                    alt="Trackify"
                                    objectFit="contain" // Ensure image covers the entire area
                                    objectPosition="center" // Center the image
                                    w="100%"
                                    h="100%" // Image takes full height
                                    display="block" // Remove any inline spacing
                                />
                            </Box>

                            <Box
                                p={6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                                w="100%" // Full width of the card
                            >
                                <Box>
                                    <Card.Title
                                        mb={2}
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="white"
                                    >
                                        Revu
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Revu is a platform that summarizes chunks of amazon reviews 
                                        for products. It provides top pros and cons, considering number of 
                                        helpful votes and overall rating, ensuring that users can make an informed 
                                        decision purchases. 

                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        <Badge colorScheme="teal" fontSize="sm">
                                            Python
                                        </Badge>
                                        <Badge colorScheme="purple" fontSize="sm">
                                            OpenAI
                                        </Badge>
                                        <Badge colorScheme="blue" fontSize="sm">
                                            AWS
                                        </Badge>
                                        <Badge colorScheme="orange" fontSize="sm">
                                            React
                                        </Badge>
                                        <Badge colorScheme="red" fontSize="sm">
                                            SQL
                                        </Badge>
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
                                    href="https://github.com/geashley/watAI"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-button"
                                >
                                    See The Code
                                </Button>
                            </Box>
                        </Card.Root>
                    </motion.div>
                    </div>
                        
                    <div className="projectsRow">

                        <motion.div
                            initial={{ x: 0, opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                        > 
                        <Card.Root
                            display="flex"
                            flexDirection="column" // Stack image on top of text
                            maxW="900px"
                            mx="auto"
                            overflow="hidden"
                            borderRadius="xl"
                            boxShadow="lg"
                            bg="black"
                            h="auto"
                            
                            width="80%" // Let the card grow to fit content
                            transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                            css={{
                                "&:hover": {
                                    transform: "scale(1.02)", // Gentle zoom effect
                                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                }
                            }}
                        >
                            <Box
                                w="100%"
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Image
                                    src={p3}
                                    alt="Trackify"
                                    objectFit="contain" // Ensure image covers the entire area
                                    objectPosition="center" // Center the image
                                    w="100%"
                                    h="100%" // Image takes full height
                                    display="block" // Remove any inline spacing
                                />
                            </Box>

                            <Box
                                p={6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                                w="100%" // Full width of the card
                            >
                                <Box>
                                    <Card.Title
                                        mb={2}
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="white"
                                    >
                                        Misc - Computer Vision  
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        A collection of random computer vision projects I've worked on. As of now, this includes face and hand trackers. 
                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        <Badge colorScheme="teal" fontSize="sm">
                                            OpenCV
                                        </Badge>
                                        <Badge colorScheme="purple" fontSize="sm">
                                            MediaPipe
                                        </Badge>
                                        <Badge colorScheme="blue" fontSize="sm">
                                            Pandas
                                        </Badge>
                                        
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
                                    href="https://github.com/yanxue06/ComputerVision-Collection"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-button"
                                >
                                    See The Code
                                </Button>
                            </Box>
                        </Card.Root>
                        </motion.div>

                        <motion.div
                        initial={{ x: 0, opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        > 
                        <Card.Root
                            display="flex"
                            flexDirection="column" // Stack image on top of text
                            maxW="900px"
                            mx="auto"
                            overflow="hidden"
                            borderRadius="xl"
                            boxShadow="lg"
                            bg="black"
                            h="auto"
                            width="80%" // Let the card grow to fit content
                            transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                            css={{
                                "&:hover": {
                                    transform: "scale(1.02)", // Gentle zoom effect
                                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                }
                            }}
                        >
                            <Box
                                w="100%"
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Image
                                    src={p3}
                                    alt="Trackify"
                                    objectFit="contain" // Ensure image covers the entire area
                                    objectPosition="center" // Center the image
                                    w="100%"
                                    h="100%" // Image takes full height
                                    display="block" // Remove any inline spacing
                                />
                            </Box>

                            <Box
                                p={6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                                w="100%" // Full width of the card
                            >
                                <Box>
                                    <Card.Title
                                        mb={2}
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="white"
                                    >
                                        House Price Predictor
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Tested various regression models (linear and forest) to accurately predict housing prices
                                         given various deciding factors. Using random forest regression, the model predicted housing prices with 
                                         a 81.54% percent accuracy
                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        <Badge colorScheme="teal" fontSize="sm">
                                            Python
                                        </Badge>
                                        <Badge colorScheme="purple" fontSize="sm">
                                            NumPy 
                                        </Badge>
                                        <Badge colorScheme="blue" fontSize="sm">
                                            Pandas
                                        </Badge>
                                        <Badge colorScheme="blue" fontSize="sm">
                                            Sckit-learn
                                        </Badge>
                                        
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
                                    href="https://github.com/yanxue06/Housing-Price-Predictor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-button"
                                >
                                    See The Code
                                </Button>
                            </Box>
                        </Card.Root>
                        </motion.div>

                    </div>
                    
                    <div className="projectsRow">

                        <motion.div
                            initial={{ x: 0, opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                        > 
                        <Card.Root
                            display="flex"
                            flexDirection="column" // Stack image on top of text
                            maxW="900px"
                            mx="auto"
                            overflow="hidden"
                            borderRadius="xl"
                            boxShadow="lg"
                            bg="black"
                            h="auto"
                            
                            width="80%" // Let the card grow to fit content
                            transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                            css={{
                                "&:hover": {
                                    transform: "scale(1.02)", // Gentle zoom effect
                                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                }
                            }}
                        >
                            <Box
                                w="100%"
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Image
                                    src={p3}
                                    alt="Trackify"
                                    objectFit="contain" // Ensure image covers the entire area
                                    objectPosition="center" // Center the image
                                    w="100%"
                                    h="100%" // Image takes full height
                                    display="block" // Remove any inline spacing
                                />
                            </Box>

                            <Box
                                p={6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                                w="100%" // Full width of the card
                            >
                                <Box>
                                    <Card.Title
                                        mb={2}
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="white"
                                    >
                                        Virtual Guitar
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        This virtual guitar maps you finger movemnet to guitar 
                                        sounds such that guitarists or new learners can practice
                                        anytime, anywhere, at no cost at all! 
                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        <Badge colorScheme="teal" fontSize="sm">
                                            OpenCV
                                        </Badge>
                                        <Badge colorScheme="purple" fontSize="sm">
                                            MediaPipe
                                        </Badge>
                                        <Badge colorScheme="blue" fontSize="sm">
                                            Pandas
                                        </Badge>
                                        
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
                                    href="https://github.com/yanxue06/Housing-Price-Predictor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-button"
                                >
                                    See The Code
                                </Button>
                            </Box>
                        </Card.Root>
                        </motion.div>

                        <motion.div
                        initial={{ x: 0, opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        > 
                        <Card.Root
                            display="flex"
                            flexDirection="column" // Stack image on top of text
                            maxW="900px"
                            mx="auto"
                            overflow="hidden"
                            borderRadius="xl"
                            boxShadow="lg"
                            bg="black"
                            h="auto"
                            width="80%" // Let the card grow to fit content
                            transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                            css={{
                                "&:hover": {
                                    transform: "scale(1.02)", // Gentle zoom effect
                                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                }
                            }}
                        >
                            <Box
                                w="100%"
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Image
                                    src={p3}
                                    alt="Trackify"
                                    objectFit="contain" // Ensure image covers the entire area
                                    objectPosition="center" // Center the image
                                    w="100%"
                                    h="100%" // Image takes full height
                                    display="block" // Remove any inline spacing
                                />
                            </Box>

                            <Box
                                p={6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                                w="100%" // Full width of the card
                            >
                                <Box>
                                    <Card.Title
                                        mb={2}
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="white"
                                    >
                                        CSV Data Normalizer 
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        This program leverages multiprocessing to efficiently normalize CSV data, 
                                        including phone numbers and dates. It also uses a tkinter user interface.

                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        <Badge colorScheme="teal" fontSize="sm">
                                            OpenCV
                                        </Badge>
                                        <Badge colorScheme="purple" fontSize="sm">
                                            MediaPipe
                                        </Badge>
                                        <Badge colorScheme="blue" fontSize="sm">
                                            Pandas
                                        </Badge>
                                        
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
                                    href="https://github.com/yanxue06/CSV_Normalization"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-button"
                                >
                                    See The Code
                                </Button>
                            </Box>
                        </Card.Root>
                        </motion.div>

                    </div>

                    {/* ROW 3 */}
                    <div className="projectsRow">
                        <motion.div
                                initial={{ x: 0, opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            > 
                            <Card.Root
                                display="flex"
                                flexDirection="column" // Stack image on top of text
                                maxW="900px"
                                boxShadow="lg"
                                bg="black"
                                mx="auto"
                                overflow="hidden"
                                borderRadius="xl"
                                h="auto"
                                width="80%" // Let the card grow to fit content
                                transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                                css={{
                                    "&:hover": {
                                        transform: "scale(1.02)", // Gentle zoom effect
                                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                    }
                                }}
                            >
                                <Box
                                    w="100%"
                                    bg="black" // Matches the card background
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        src={p3}
                                        alt="Trackify"
                                        objectFit="contain" // Ensure image covers the entire area
                                        objectPosition="center" // Center the image
                                        w="100%"
                                        h="100%" // Image takes full height
                                        display="block" // Remove any inline spacing
                                    />
                                </Box>

                                <Box
                                    p={6}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    w="100%" // Full width of the card
                                >
                                    <Box>
                                        <Card.Title
                                            mb={2}
                                            fontSize="2xl"
                                            fontWeight="bold"
                                            color="white"
                                        >
                                            RFID Card Swipe
                                        </Card.Title>
                                        <Card.Description
                                            fontSize="lg"
                                            lineHeight="tall"
                                            color="gray.300"
                                            width="100%"
                                        >
                                            A simple Java-based system that emulates RFID card swipes using a GUI. 
                                            Users can input their RFID tag, name, and other details, which are stored in a text file. 
                                            The system allows creating, updating, viewing, and deleting user information through a straightforward interface.

                                        </Card.Description>

                                        <HStack mt={4} spacing={3} flexWrap="wrap" >
                                            <Badge colorScheme="teal" fontSize="sm">
                                                Python
                                            </Badge>
                                            <Badge colorScheme="purple" fontSize="sm">
                                                PostgreSQL
                                            </Badge>
                                            <Badge colorScheme="blue" fontSize="sm">
                                                React
                                            </Badge>
                                            <Badge colorScheme="orange" fontSize="sm">
                                                JavaScript
                                            </Badge>
                                            <Badge colorScheme="red" fontSize="sm">
                                                HTML
                                            </Badge>
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
                                        href="https://github.com/yanxue06/rfid-card-swipe"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-button"
                                    >
                                        See The Code
                                    </Button>
                                </Box>
                            </Card.Root>
                        </motion.div>

                        <motion.div
                                initial={{ x: 0, opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            > 
                            <Card.Root
                                display="flex"
                                flexDirection="column" // Stack image on top of text
                                maxW="900px"
                                boxShadow="lg"
                                bg="black"
                                mx="auto"
                                overflow="hidden"
                                borderRadius="xl"
                                h="auto"
                                width="80%" // Let the card grow to fit content
                                transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                                css={{
                                    "&:hover": {
                                        transform: "scale(1.02)", // Gentle zoom effect
                                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                    }
                                }}
                            >
                                <Box
                                    w="100%"
                                    bg="black" // Matches the card background
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        src={p3}
                                        alt="Trackify"
                                        objectFit="contain" // Ensure image covers the entire area
                                        objectPosition="center" // Center the image
                                        w="100%"
                                        h="100%" // Image takes full height
                                        display="block" // Remove any inline spacing
                                    />
                                </Box>

                                <Box
                                    p={6}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    w="100%" // Full width of the card
                                >
                                    <Box>
                                        <Card.Title
                                            mb={2}
                                            fontSize="2xl"
                                            fontWeight="bold"
                                            color="white"
                                        >
                                            LinkCom
                                        </Card.Title>
                                        <Card.Description
                                            fontSize="lg"
                                            lineHeight="tall"
                                            color="gray.300"
                                            width="100%"
                                        >
                                            LinkCom serves the purpose of bridging the communication troubles between the hard of hearing and society. 
                                            This project implements a bidirectional communication system using STM32 microcontrollers, an LCD, a keypad, and GPIO signals. 
                                            The system enables users to send and receive predefined messages through a simple interface. 

                                        </Card.Description>

                                        <HStack mt={4} spacing={3} flexWrap="wrap" >
                                            <Badge colorScheme="teal" fontSize="sm">
                                                STM32
                                            </Badge>
                                            <Badge colorScheme="purple" fontSize="sm">
                                                C
                                            </Badge>
                                            
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
                                        href="https://github.com/yanxue06/LinkCom"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-button"
                                    >
                                        See The Code
                                    </Button>
                                </Box>
                            </Card.Root>
                        </motion.div>
                    </div>

                    {/* ROW 4 */}
                    {/* ROW 3 */}
                    <div className="projectsRow">
                        <motion.div
                                initial={{ x: 0, opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            > 
                            <Card.Root
                                display="flex"
                                flexDirection="column" // Stack image on top of text
                                maxW="900px"
                                boxShadow="lg"
                                bg="black"
                                mx="auto"
                                overflow="hidden"
                                borderRadius="xl"
                                h="auto"
                                width="80%" // Let the card grow to fit content
                                transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                                css={{
                                    "&:hover": {
                                        transform: "scale(1.02)", // Gentle zoom effect
                                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                    }
                                }}
                            >
                                <Box
                                    w="100%"
                                    bg="black" // Matches the card background
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        src={p3}
                                        alt="Trackify"
                                        objectFit="contain" // Ensure image covers the entire area
                                        objectPosition="center" // Center the image
                                        w="100%"
                                        h="100%" // Image takes full height
                                        display="block" // Remove any inline spacing
                                    />
                                </Box>

                                <Box
                                    p={6}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    w="100%" // Full width of the card
                                >
                                    <Box>
                                        <Card.Title
                                            mb={2}
                                            fontSize="2xl"
                                            fontWeight="bold"
                                            color="white"
                                        >
                                            Portfolio
                                        </Card.Title>
                                        <Card.Description
                                            fontSize="lg"
                                            lineHeight="tall"
                                            color="gray.300"
                                            width="100%"
                                        >
                                            This website! This is one of my first projects using react and hosting projects and it was a lot of fun to make. 
                                        </Card.Description>

                                        <HStack mt={4} spacing={3} flexWrap="wrap" >
                                            <Badge colorScheme="teal" fontSize="sm">
                                                Python
                                            </Badge>
                                            <Badge colorScheme="blue" fontSize="sm">
                                                React
                                            </Badge>
                                            <Badge colorScheme="orange" fontSize="sm">
                                                JavaScript
                                            </Badge>
                                            <Badge colorScheme="blue" fontSize="sm">
                                                Figma
                                            </Badge>
                                            
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
                                        href="https://github.com/yanxue06/Portfolio"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-button"
                                    >
                                        See The Code
                                    </Button>
                                </Box>
                            </Card.Root>
                        </motion.div>

                        <motion.div
                                initial={{ x: 0, opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                            > 
                            <Card.Root
                                display="flex"
                                flexDirection="column" // Stack image on top of text
                                maxW="900px"
                                boxShadow="lg"
                                bg="black"
                                mx="auto"
                                overflow="hidden"
                                borderRadius="xl"
                                h="auto"
                                width="80%" // Let the card grow to fit content
                                transition="transform 0.3s ease, box-shadow 0.3s ease" // Transition for smooth effect
                                css={{
                                    "&:hover": {
                                        transform: "scale(1.02)", // Gentle zoom effect
                                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)", // Enhanced glow
                                    }
                                }}
                            >
                                <Box
                                    w="100%"
                                    bg="black" // Matches the card background
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Image
                                        src={p3}
                                        alt="Trackify"
                                        objectFit="contain" // Ensure image covers the entire area
                                        objectPosition="center" // Center the image
                                        w="100%"
                                        h="100%" // Image takes full height
                                        display="block" // Remove any inline spacing
                                    />
                                </Box>

                                <Box
                                    p={6}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    w="100%" // Full width of the card
                                >
                                    <Box>
                                        <Card.Title
                                            mb={2}
                                            fontSize="2xl"
                                            fontWeight="bold"
                                            color="white"
                                        >
                                            Trackify
                                        </Card.Title>
                                        <Card.Description
                                            fontSize="lg"
                                            lineHeight="tall"
                                            color="gray.300"
                                            width="100%"
                                        >
                                            Trackify is designed for users to manage,
                                            visualize, and improve their spending
                                            habits. It includes login, registration, and
                                            full CRUD functionality for expense
                                            tracking. I created this app appealing to its ability 
                                            for visually spending through more than just numbers, 
                                            but also extending to graphs. 
                                        </Card.Description>

                                        <HStack mt={4} spacing={3} flexWrap="wrap" >
                                            <Badge colorScheme="teal" fontSize="sm">
                                                Python
                                            </Badge>
                                            <Badge colorScheme="purple" fontSize="sm">
                                                PostgreSQL
                                            </Badge>
                                            <Badge colorScheme="blue" fontSize="sm">
                                                Django
                                            </Badge>
                                            <Badge colorScheme="orange" fontSize="sm">
                                                JavaScript
                                            </Badge>
                                            <Badge colorScheme="red" fontSize="sm">
                                                BootStrap
                                            </Badge>
                                           
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
                                        href="https://github.com/yanxue06/Portfolio"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-button"
                                    >
                                        See The Code
                                    </Button>
                                </Box>
                            </Card.Root>
                        </motion.div>
                    </div>
                </div>
        </section>
    );
}

{
    /* <Card
    sx={{
        maxWidth: 500,
        backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
        color: "white",
        boxShadow:
            "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
        transition:
            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
        ":hover": {
            transform: "scale(1.05)", // Slight zoom-in on hover
            boxShadow:
                "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
        },
    }}
>
    <CardMedia
        component="img"
        alt="green iguana"
        height="250"
        image={p4}
    />
    <CardContent>
        <Typography
            gutterBottom
            variant="h5"
            component="div"
        >
            Trackify
        </Typography>
        <Typography
            variant="body2"
            sx={{ color: "white" }}
        >
            Custom built expense tracker!
        </Typography>
    </CardContent>

    <CardActions>
        <Button size="small"> See the Code </Button>
    </CardActions>
</Card>
<Card
    sx={{
        maxWidth: 500,
        backgroundColor: "rgb(22, 29, 37, 255)", // Dark background for the card
        color: "white",
        boxShadow:
            "0 0 8px 8px rgba(235, 235, 235, 0.4)", // Subtle shadow
        transition:
            "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
        ":hover": {
            transform: "scale(1.05)", // Slight zoom-in on hover
            boxShadow:
                "0 0 6px 15px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
        },
    }}
>
    <CardMedia
        component="img"
        alt="green iguana"
        height="250"
        image={p4}
    />
    <CardContent>
        <Typography
            gutterBottom
            variant="h5"
            component="div"
        >
            Trackify
        </Typography>
        <Typography
            variant="body2"
            sx={{ color: "white" }}
        >
            Custom built expense tracker!
        </Typography>
    </CardContent>
    <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ md: 1 }}
    >
        <Item>Python</Item>
        <Item>Django</Item>
        <Item>PostgreSQL</Item>
        <Item>CRUD</Item>
    </Stack>
    <CardActions>
        <Button size="small"> See the Code </Button>
    </CardActions>
</Card> */
}

<Card.Root
    display="flex"
    alignItems="stretch" // Make children fill the card's height
    flexDirection={{ base: "column", md: "row" }} // Stacked on small screens, side-by-side on larger
    maxW="900px"
    mx="auto"
    overflow="hidden"
    borderRadius="xl"
    boxShadow="lg"
    bg="black"
    h="400px" // Fixed card height
>
    {/* Image Section */}
    <Box
        flexShrink={0}
        w={{ base: "100%", md: "50%" }}
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="black" // Matches the card's background
    >
        {/* "Monitor" Frame */}
        <Box
            w="95%"
            h="95%"
            border="6px solid #444" // This acts as the bezel around the image
            borderRadius="md"
            overflow="hidden"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.6)"
            bg="black" // Ensures the bezel is uniformly black
        >
            <Image
                src={p3}
                alt="Trackify"
                objectFit="contain" // Display the full image without cropping
                objectPosition="center" // Center the image inside the frame
                w="100%"
                h="100%"
                display="block" // Remove any inline spacing issues
            />
        </Box>
    </Box>

    {/* Text Section */}
    <Box
        flex="1"
        p={6}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        h="100%"
    >
        <Box>
            <Card.Title mb={2} fontSize="2xl" fontWeight="bold" color="white">
                Trackify
            </Card.Title>
            <Card.Description fontSize="lg" lineHeight="tall" color="gray.300">
                Trackify is designed for users to manage, visualize, and improve
                their spending habits. It includes login, registration, and full
                CRUD functionality for expense tracking.
            </Card.Description>
            <HStack mt={4} spacing={3} flexWrap="wrap" >
                <Badge colorScheme="teal" fontSize="sm">
                    Python
                </Badge>
                <Badge colorScheme="purple" fontSize="sm">
                    PostgreSQL
                </Badge>
                <Badge colorScheme="blue" fontSize="sm">
                    React
                </Badge>
                <Badge colorScheme="orange" fontSize="sm">
                    JavaScript
                </Badge>
                <Badge colorScheme="red" fontSize="sm">
                    HTML
                </Badge>
            </HStack>
        </Box>
        <Card.Footer>
            <Button
                variant="solid"
                bg="white"
                color="black"
                fontSize="sm"
                _hover={{ bg: "gray.300" }}
            >
                See The Code
            </Button>
        </Card.Footer>
    </Box>
</Card.Root>;
