import * as React from 'react'; 
import '../Home.css'; 
import '../particle.scss'; 
import '../timeline.css';
import '../arrow.scss'
import TimeLine from '../components/timeline'
import Intro from '../components/intro'
import About from '../components/about'

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
  
  
  return (
    <>  
      <Intro/> 

      {/* <div className="gradientBridge"> </div>  */}

      {/* <section className="p2">     
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
        </section>  */}
      
      <section className="p2">

        <About/> 

        <TimeLine/>
        
      </section> 
       

      {/* <motion.div
        className="flex justify-center w-full py-2 md:mt-0 mt-[520px] overflow-hidden dark:text-[#ececec]"
        initial={{ x: 0, opacity: 0 }}
        whileInView={{ x: -10, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.8 }}
      >
        <br/> 
          <hr width="70%" color="#2c2b2c" size="5px"/>
        <br/> 
      </motion.div>  */}


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
