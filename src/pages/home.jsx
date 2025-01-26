import React from 'react'; 
import '../Home.css'; 
import '../particle.scss'; 
import '../timeline.css';
import Typewriter from '../components/typewriter'
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import HongMall from '../images/HongMall.png'; 
import MidnightSun from '../images/MidnightSun.jpeg'; 
import Navbar from '../components/navbar';
import Yan from '../images/Yan.jpeg'
import '../navbar.css';
import Grid2 from '@mui/material/Grid2';
import { motion } from "framer-motion";

import { Timeline, TimelineItem }  from 'vertical-timeline-component-for-react';
import { Badge, Box, Button, Card, HStack, Image } from "@chakra-ui/react"


export default function App() {

  return (
    <>  
    <section id="home" className="p1" >
      <div className="animation-wrapper">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
      </div>

      <motion.div
              className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
              initial={{ x: 0, opacity: 0 }}
              whileInView={{ x: -10, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.8 }}
      >
        <div className="intro"> 
          <div className="box"> 
            <div className="top-section"> 
              <Typewriter text="Hi, I'm Yan" speed={200} highlightWord='Yan'/>
            </div>
            
            
            <div className="bottom-section"> 
                ECE Student at The University of Waterloo  
            </div> 
            
              <div className="logo">
                <div className="linkedin"> 
                  <a
                    href="https://linkedin.com/in/yanxue-ce/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin size={50}/>
                  </a>
                </div> 

                <div className="github"> 
                  <a
                    href="https://github.com/yanxue06"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub size={50}/>
                  </a>
                </div>

              </div> 
            </div>
          </div>
        </motion.div>     
      </section>

      {/* <div className="gradientBridge"> </div>  */}

      <section className="p2">     
        <section id="about">     
          <Grid2
            container
            spacing={{
              xs: 3, // Small gaps for phones
              sm: 4, // Medium gaps for tablets
              md: 7, // Larger gaps for laptops
              lg: 13, // Even larger gaps for desktops
            }}
          >
            <Grid2 size="grow">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'right',
                  marginTop: '5%', 
                }}
              >
                <motion.div
                  className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
                  initial={{ x: 0, opacity: 0 }}
                  whileInView={{ x: -10, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                > 
                  <div className="Yan"> 
                    <img src={Yan} alt="Yan"/> 
                  </div>
                </motion.div>
              </div>
            </Grid2>

            <Grid2 size="grow">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column', 
                  alignItems: 'left',
                  marginTop: '5%', 
                }}
              >
                <motion.div
                  className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
                  initial={{ x: 0, opacity: 0 }}
                  whileInView={{ x: -10, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                >
                  
                  <div className="title" style={{marginBottom: '2%'}}> 
                    <h1> About me </h1> 
                  </div>
                  <div className="text"> 
                      <p> Hey! I'm Yan Xue, a passionate software developer and AI enthusiast 
                          studying Computer Engineering at The Univerisity of Waterloo. I'm originally 
                          from Vancouver, BC, but I'll be studying abroad at Waterloo, ON for the next 5 years. I'm 
                          always excited to improve my skills and explore new experiences. Having said that,
                          I am welcome to discuss any new oppurtunities! 
                      </p>  
                  </div>
                </motion.div> 
              </div>
            </Grid2>
        </Grid2> 
        </section> 


        <br/> 
          <motion.div
            className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
            initial={{ x: 0, opacity: 0 }}
            whileInView={{ x: -10, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.8 }}
          >
            <hr width="70%" color="#2c2b2c" size="5px"/>
          </motion.div>
        <br/> 

        <div id="experience" className="exp_heading"> Experience </div> 


          
        <Timeline lineColor={'#ddd'}>
            <motion.div
              className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
              initial={{ x: 0, opacity: 0 }}
              whileInView={{ x: -10, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.8 }}
            >  
            <TimelineItem
              key="002"
              dateText="Jan 2025 - Apr 2025"
              dateInnerStyle={{ background: 'rgb(151, 176, 207)', color: '#000' }}
              bodyContainerStyle={{
                background: '#ddd',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0.5rem 0.5rem 2rem 0 rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ color: 'black' }}>Automation Developer</h3>
              <h5>HongMall</h5> 
              <ul>
                <li> implemented an autonomous robot </li>
                <li> made the grid for the robot map.. </li> 
 
              </ul> 
            </TimelineItem>
            </motion.div>
            <motion.div
              className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
              initial={{ x: 0, opacity: 0 }}
              whileInView={{ x: -10, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.8 }}
            >
            <TimelineItem
              key="002"
              dateText="Nov 2024 - Dec 2024"
              dateInnerStyle={{ background: 'rgb(151, 176, 207)', color: '#000' }}
              bodyContainerStyle={{
                background: '#ddd',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0.5rem 0.5rem 2rem 0 rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ color: 'black' }}>Firmware Member</h3>
              <h5>Midnight Sun Solar Rayce Car Team</h5>
              <ul>
                <li> Implemented an ADC driver for the ADS1115 with low-level C firmware and I2C communication </li> 
                <li> Configured the ADS1115 Multi-Channel ADC by adjusting bit fields according to the ADS datasheet </li> 
                <li> Created a backup driver using STM32’s Backup registers, ensuring secure data storage and access control during power loss </li>
              </ul> 
            </TimelineItem>
            </motion.div>
            <motion.div
              className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
              initial={{ x: 0, opacity: 0 }}
              whileInView={{ x: -10, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.8 }}
            >
            <TimelineItem
              key="002"
              dateText="Feb 2023 - Aug 2024"
              dateInnerStyle={{ background: 'rgb(151, 176, 207)', color: '#000' }}
              bodyContainerStyle={{
                background: '#ddd',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0.5rem 0.5rem 2rem 0 rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ color: 'black' }}>Software Engineer</h3>
              <h5> Skynet Security System </h5> 
                <ul> 
                  <li> Interned at Skynet Security System, a local technology company, to perform network troubleshooting, structured cabling services, and ethernet installation for over 35+ households and businesses across greater Vancouver </li> 
                  <li> Developed a multiprocessing Python script that performed CSV data normalization for 500+ company files, improving file processing speed by over 200% and enhancing operational workflows </li> 
                </ul> 
            </TimelineItem>
            </motion.div>
            <motion.div
              className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
              initial={{ x: 0, opacity: 0 }}
              whileInView={{ x: -10, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.8 }}
            >
            <TimelineItem
              key="002"
              dateText="Jun 2024 - Aug 2024"
              dateInnerStyle={{ background: 'rgb(151, 176, 207)', color: '#000' }}
              bodyContainerStyle={{
                background: '#ddd',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0.5rem 0.5rem 2rem 0 rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ color: 'black' }}>Engineering Intructor</h3> 
              <h5> SFU Camps </h5> 
              <ul> 
                <li> Collaborated with staff to oversee STEM lessons and icebreakers for 60+ youth aged 6-14 </li>
                <li> Practiced communication, organization, and mentorship skills through instructing a curriculum on
                    aerodynamics for 20+ youth, resulting in 100% completion of hands-on rocket ship projects </li> 
              </ul> 
            </TimelineItem>
             </motion.div>
      </Timeline>

        <motion.div
          className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
          initial={{ x: 0, opacity: 0 }}
          whileInView={{ x: -10, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.8 }}
        >
          <br/> 
            <hr width="70%" color="#2c2b2c" size="5px"/>
          <br/> 
        </motion.div> 

      </section>    

      <section id="projects" className="p3"> 
          <div className="project_heading"> Projects </div>
            <Card.Root flexDirection="row" overflow="hidden" maxW="xl">
              <Image
                objectFit="cover"
                maxW="200px"
                src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
                alt="Caffe Latte"
              />
              <Box>
                <Card.Body>
                  <Card.Title mb="2">The perfect latte</Card.Title>
                  <Card.Description>
                    Caffè latte is a coffee beverage of Italian origin made with espresso
                    and steamed milk.
                  </Card.Description>
                  <HStack mt="4">
                    <Badge>Hot</Badge>
                    <Badge>Caffeine</Badge>
                  </HStack>
                </Card.Body>
                <Card.Footer>
                  <Button>Buy Latte</Button>
                </Card.Footer>
              </Box>
            </Card.Root>
          <div className="projects"> 

          </div> 
      </section> 
      

      <section id="contact" className="p4">
        <div className="socials"> 
          <div className="contact_heading"> Contact Me! </div>
            <div className="contact_description"> Open to any and all oppurtunities :) </div> 
            <div className="contact_list"> 
            <ul> 
              <li> Email: <a href="mailto:y9xue@uwaterloo.ca"> y9xue@uwaterloo.ca</a>  </li> 
              <li> LinkedIn: <a href="https://linkedin.com/in/yanxue-ce"> linkedin.com/in/yanxue-ce</a> </li>
              <li> GitHub: <a href="https://github.com/yanxue06"> github.com/yanxue06 </a></li>
              <li> Resume: </li>
            </ul>
          </div>
        </div>  
        
      </section> 
      
    </>
  );
}
