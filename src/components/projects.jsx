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
import "../home.css";
import p4 from "../images/p3.png";
import p2 from "../images/p2.png";
import { Badge, Box, Button, Card, HStack, Image, For } from "@chakra-ui/react";
import { motion } from "framer-motion";

export default function Projects() {
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
                
                        <motion.div
                            initial={{ x: 0, opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            <div id="projects" className="heading">
                                <For each={["subtle"]}>
                                    {(variant) => (
                                        <Card.Root
                                            style={{
                                                width: window.innerWidth < 500 ? "80%" : "100%", // Adjust the width dynamically
                                                margin: "0 auto" // Optional: Center the element for smaller screens
                                            }}
                                            variant={variant}
                                            key={variant}
                                            css={{
                                                border: "2px solid rgba(235, 235, 235, 0.6)", // Outline
                                                backgroundColor:
                                                    "rgb(22, 29, 37, 255)",
                                                borderRadius: "8px", // Rounded corners
                                                transition:
                                                    "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover effect
                                                "&:hover": {
                                                    transform: "scale(1.02)", // Slight zoom on hover
                                                    boxShadow:
                                                        "0 0 10px rgba(255, 255, 255, 0.2)", // Shadow on hover
                                                },
                                            }}
                                        >
                                            <Card.Body
                                                gap="2"
                                                css={{ textAlign: "center" }}
                                            >
                                                <Card.Title
                                                    mb="2"
                                                    css={{
                                                        fontSize: "35px",
                                                        fontWeight:
                                                            "bold" /* Make the text bold */,
                                                        color: "white" /* White text color for contrast */,
                                                        letterSpacing:
                                                            "3px" /* Add spacing between letters */,
                                                    }}
                                                >
                                                    Projects
                                                </Card.Title>
                                            </Card.Body>
                                        </Card.Root>
                                    )}
                                </For>
                            </div>
                        </motion.div>
                        
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
                                    src={p4}
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
                                    src={p4}
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
                                    src={p4}
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
</Card>
</div>
<div className="projectsRow">
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
    <CardActions>
        <Button size="small"> See the Code </Button>
    </CardActions>
</Card>
</div>
<div className="projectsRow">
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
    <CardActions>
        <Button size="small"> See the Code </Button>
    </CardActions>
</Card> */
}

<Card.Root
    display="flex"
    alignItems="stretch" // Make children fill the card’s height
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
        bg="black" // Matches the card’s background
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
                src={p4}
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
