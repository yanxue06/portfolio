import * as React from "react";
import "../styles/home.css";
import "../styles/projects.css";
import trackify from "../images/projects/Trackify.svg";
import blank from "../images/projects/Blank.svg";
import Comparisum from "../images/projects/Comparisum.svg";
import RFID from "../images/projects/RFID.svg";
import JobBot from "../images/projects/JobBot.svg";
import housing from "../images/projects/Housing.svg";
import LinkCom from "../images/projects/LinkCom.png";
import CSV from "../images/projects/CSV.svg";
import Portfolio from "../images/projects/Portfolio.svg";
import { Badge, Box, Button, Card, HStack, Image} from "@chakra-ui/react";
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
                                <Image
                                    src={blank}
                                    width = "800px"
                                    alt="Coming Soon..."
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
                                        Coming Soon... 
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Coming Soon... 
                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        
                                        
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
                                    src={JobBot}
                                    alt="JobBot"
                                    objectFit="contain" // Ensure image covers the entire area
                                    w="100%"
                                    h="100%" 
                                    display="absolute" // Remove any inline spacing
                                    zIndex="1000"
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
                                        JobBot
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Job Scraper with AI integration for increasing the efficiency 
                                        of the job search process. It scrapes websites for key details 
                                        then uses LLama to summarize the posting. The application then saves all scraped
                                        data into an Excel file.
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
                                            Llama
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
                    </div>
                        
                    {/* ROW 2 */}
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
                                    src={Comparisum}
                                    alt="Comparisum"
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
                                        Comparisum 
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Comparisum is a platform that summarizes chunks of amazon reviews 
                                        for products. It provides top pros and cons, considering number of 
                                        helpful votes and overall rating, ensuring that users can make an informed 
                                        decision purchases. 

                                    </Card.Description>

                                    <HStack mt={4} spacing={3} flexWrap="wrap" >
                                        <Badge colorScheme="teal" fontSize="sm">
                                            Python
                                        </Badge>
                                        <Badge colorScheme="purple" fontSize="sm">
                                            Llama
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
                                    src={blank} 
                                    alt="blank"
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
                                    src={housing}
                                    alt="House Price Predictor"
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
                                    src={CSV}
                                    alt="CSV Data Normalizer"
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

                    {/* ROW 4 */}
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
                                        src={RFID}
                                        alt="RFID Card Swipe"
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
                                        src={LinkCom}
                                        alt="LinkCom"
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

                    {/* ROW 5 */}
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
                                        src={trackify}
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
                                        src={Portfolio}
                                        alt="Portfolio"
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
                                            This portfolio was one of my first projects with React. From the designing on Figma
                                            and then translating everything to code, the whole process was so fun! 
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
                    </div>
                </div>
        </section>
    );
}

