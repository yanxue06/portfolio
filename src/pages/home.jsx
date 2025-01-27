import * as React from 'react'; 
import '../Home.css'; 
import '../particle.scss'; 
import '../timeline.css';
import Typewriter from '../components/typewriter'
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

import HongMall from '../images/HongMall.png'; 
import MidnightSun from '../images/MidnightSun.jpeg'; 
import Navbar from '../components/navbar';

import p4 from '../Images/p3.png'
import Yan from '../images/Yan.jpeg'
import '../navbar.css';
import Grid2 from '@mui/material/Grid2';
import { motion } from "framer-motion";

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import HotelIcon from '@mui/icons-material/Hotel';
import RepeatIcon from '@mui/icons-material/Repeat';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';





export default function App() {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const DemoPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: 'black', // Darker background color
    color: '#E2D9FF', // Soft text color
    padding: theme.spacing(2), // Spacing for inner content
    borderRadius: theme.spacing(1.5), // Rounded corners
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)', // Subtle shadow
    maxWidth: '700px', // Optional: Limit the max width for better layout
    maxHeight: '300px', 
    position: 'relative', // To position the arrow
    wordWrap: 'break-word', 
    overflowWrap: 'break-word', 
    '&:before': { /* for the arrow coming out of the component */ 
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '-10px',
      transform: 'translateY(-50%)',
      width: '0',
      height: '0',
      borderStyle: 'solid',
      borderWidth: '10px 10px 10px 0',
      borderColor: `transparent #3A3B5A transparent transparent`, // Match the background
    },
  }));
  
  
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
                          always excited to improve my skills and explore new experiences. Feel free to reach out. I am open to any and all oppurtunities! 
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
        
        <Timeline position="alternate">
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align="right"
              variant="body2"
              color="black"
            >
              9:30 am
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot>
                <FastfoodIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2, color: "black"}}>
              <Stack direction="row" spacing={2}>
                <DemoPaper square={false}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Software Engineer Intern | HongMall 
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontStyle: 'italic', color: '#C4B4FF' }}>
                    New York, NY
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: '8px' }}>
                    - Developing an interface to communicate with auonomous warehouse transpot robots
                  </Typography>
                </DemoPaper>
              </Stack>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              variant="body2"
              color="black"
            >
              10:00 am
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary">
                <LaptopMacIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2, color: "black"}}>
              <Typography variant="h6" component="span">
                Code
              </Typography>
              <Typography>Because it&apos;s awesome!</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary" variant="outlined">
                <HotelIcon />
              </TimelineDot>
              <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2, color: 'black'}}>
              <Typography variant="h6" component="span">
                Sleep
              </Typography>
              <Typography>Because you need rest</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
              <TimelineDot color="secondary">
                <RepeatIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2, color: "black"}}>
              <Typography variant="h6" component="span">
                Repeat
              </Typography>
              <Typography>Because this is the life you love!</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>

{/*           
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
      </Timeline> */}

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
        <div className = "projects"> 
          <div className="projectsCol"> 
            <div className="project_heading"> Projects </div>
              <div className="projectsRow"> 
                <Card sx={{ 
                  maxWidth: 500, 
                  backgroundColor: '#1e1e1e', // Dark background for the card
                  color: 'white', 
                  boxShadow: '0 0 8px 8px rgba(235, 235, 235, 0.4)', // Subtle shadow
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                  ':hover': {
                    transform: 'scale(1.05)', // Slight zoom-in on hover
                    boxShadow: '0 0 6px 15px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                  },
                }}>
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    height="250"
                    image={p4}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Trackify
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Custom built expense tracker! 
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button size="small"> See the Code </Button>
                  </CardActions>
                </Card>
                <Card sx={{ 
                  maxWidth: 500, 
                  backgroundColor: '#1e1e1e', // Dark background for the card
                  color: 'white', 
                  boxShadow: '0 0 8px 8px rgba(235, 235, 235, 0.4)', // Subtle shadow
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                  ':hover': {
                    transform: 'scale(1.05)', // Slight zoom-in on hover
                    boxShadow: '0 0 6px 15px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                  },
                }}>
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    height="250"
                    image={p4}

                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Trackify
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Custom built expense tracker! 
                    </Typography>
                  </CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
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
                <Card sx={{ 
                  maxWidth: 500, 
                  backgroundColor: '#1e1e1e', // Dark background for the card
                  color: 'white', 
                  boxShadow: '0 0 8px 8px rgba(235, 235, 235, 0.4)', // Subtle shadow
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                  ':hover': {
                    transform: 'scale(1.05)', // Slight zoom-in on hover
                    boxShadow: '0 0 6px 15px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                  }, 
                }}>
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    height="250"
                    image={p4}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Trackify
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Custom built expense tracker! 
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small"> See the Code </Button>
                  </CardActions>
                </Card>
                <Card sx={{ 
                  maxWidth: 500, 
                  backgroundColor: '#1e1e1e', // Dark background for the card
                  color: 'white', 
                  boxShadow: '0 0 8px 8px rgba(235, 235, 235, 0.4)', // Subtle shadow
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                  ':hover': {
                    transform: 'scale(1.05)', // Slight zoom-in on hover
                    boxShadow: '0 0 6px 15px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                  },
                }}>
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    height="250"
                    image={p4}

                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Trackify
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Custom built expense tracker! 
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small"> See the Code </Button>
                  </CardActions>
                </Card>
            </div> 
            <div className="projectsRow"> 
                <Card sx={{ 
                  maxWidth: 500, 
                  backgroundColor: '#1e1e1e', // Dark background for the card
                  color: 'white', 
                  boxShadow: '0 0 8px 8px rgba(235, 235, 235, 0.4)', // Subtle shadow
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                  ':hover': {
                    transform: 'scale(1.05)', // Slight zoom-in on hover
                    boxShadow: '0 0 6px 15px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                  },
                }}>
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    height="250"
                    image={p4}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Trackify
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Custom built expense tracker! 
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small"> See the Code </Button>
                  </CardActions>
                </Card>
                <Card sx={{ 
                  maxWidth: 500, 
                  backgroundColor: '#1e1e1e', // Dark background for the card
                  color: 'white', 
                  boxShadow: '0 0 8px 8px rgba(235, 235, 235, 0.4)', // Subtle shadow
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                  ':hover': {
                    transform: 'scale(1.05)', // Slight zoom-in on hover
                    boxShadow: '0 0 6px 15px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                  }, 
                }}>
                  <CardMedia
                    component="img"
                    alt="green iguana"
                    height="250"
                    image={p4}

                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      Trackify
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Custom built expense tracker! 
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small"> See the Code </Button>
                  </CardActions>
                </Card>
            </div> 
            </div>
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
