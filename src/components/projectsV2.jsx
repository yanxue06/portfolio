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
import p3 from "../images/projects/p3.svg";
import p2 from "../images/projects/p2.svg";
import { Badge, Box, Button, Card, HStack, Image, For } from "@chakra-ui/react";
import { motion } from "framer-motion";

export default function ProjectsV2() {
    // const Item = styled(Paper)(({ theme }) => ({
    //     backgroundColor: "#fff",
    //     ...theme.typography.body2,
    //     padding: theme.spacing(1),
    //     textAlign: "center",
    //     color: theme.palette.text.secondary,
    // }));
    return (
        <section id="projects" className="p3">
            <div className="projects">
                <div className="projectsCol">
                    {/* <div className="projectsRow"> */}
                        
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
                            {/* Image Section */}
                            <Box
                                w="100%"
                                h="500px" // Image takes up a fixed height (adjustable)
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {/* Image */}
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
                                        tracking.
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
                        {/* Image Section */}
                        <Box
                            w="100%"
                            h="500px" // Image takes up a fixed height (adjustable)
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
                                    letter generation. Saves all scraped key scraped info
                                    into an Excel file, so you can keep tabs on your applications. 
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
                            {/* Image Section */}
                            <Box
                                w="100%"
                                h="500px" // Image takes up a fixed height (adjustable)
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {/* Image */}
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
                                        Virtual Guitar
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Guitar, but virtual! Integrates OpenCV and
                                        MediaPipe ...
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
                            {/* Image Section */}
                            <Box
                                w="100%"
                                h="500px" // Image takes up a fixed height (adjustable)
                                bg="black" // Matches the card background
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {/* Image */}
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
                                        Virtual Guitar
                                    </Card.Title>
                                    <Card.Description
                                        fontSize="lg"
                                        lineHeight="tall"
                                        color="gray.300"
                                        width="100%"
                                    >
                                        Guitar, but virtual! Integrates OpenCV and
                                        MediaPipe ...
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
                                >
                                    See The Code
                                </Button>
                            </Box>
                        </Card.Root>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
