import * as React from 'react'; 
import '../Home.css'; 
import '../particle.scss'; 
import '../timeline.css';
import '../arrow.scss'

import Yan from '../images/Yan.jpeg'
import '../navbar.css';
import Grid2 from '@mui/material/Grid2';
import { motion } from "framer-motion";
import { Badge, Box, Button, Card, HStack, Image } from "@chakra-ui/react"



export default function About() { 
    return ( 
        <section id="about" className="about">     
            <motion.div
                className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
                initial={{ x: 0, opacity: 0 }}
                whileInView={{ x: -10, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.8 }}
            > 
                <Card.Root 
                    flexDirection="row" 
                    overflow="hidden" 
                    maxW="xl"
                    css={{
                        boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)", // Subtle shadow
                        transition: "transform 0.3s ease, box-shadow 0.3s ease", // Smooth animation
                        "&:hover": {
                            transform: "scale(1.02)", // Slight zoom-in on hover
                            boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)", // Enhanced shadow on hover
                        },
                        }}
                >

                    <Image
                    objectFit="cover"
                    maxW="300px"
                    src={Yan}
                    alt="About Me" 
                    
                    />
                    <Box>
                    <Card.Body>
                        <Card.Title mb="2">About Me</Card.Title>
                        <Card.Description>
                        Hey! I'm Yan Xue, a passionate software developer and AI enthusiast 
                            studying Computer Engineering at The Univerisity of Waterloo. I'm originally 
                            from Vancouver, BC, but I'll be studying abroad at Waterloo, ON for the next 5 years. I'm 
                            always excited to improve my skills and explore new experiences. Feel free to reach out. I am open to any and all oppurtunities! 
                        </Card.Description>

                    </Card.Body>
                    <Card.Footer>
                        <Button color="white" _hover={{ bg: "rgba(141, 140, 178, 0.79)" }}> Gallery </Button>
                        <Card.Description>
                            Some Pictures of my Life 
                        </Card.Description>
                        
                    </Card.Footer>
                    </Box>
                </Card.Root>
            </motion.div>
        
        </section>
    );
} 