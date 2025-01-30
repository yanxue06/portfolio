import * as React from 'react'; 
import '../Home.css'; 
import '../particle.scss'; 
import '../timeline.css';
import '../arrow.scss'
import Typewriter from '../components/typewriter'
import { motion } from "framer-motion";
import Button from '@mui/material/Button';
import TypeWriter from './typewriter'
import '../stars.scss'

export default function intro() {
    return ( 
        <section id="home" className="p1" >
            {/* <div className="animation-wrapper">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
            </div> */}
            <div class="stars">
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
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
                        <TypeWriter/> 
                        <span> 
                            I'm 
                        </span>
                        <div className='name'> 
                            <span
                                style={{
                                    color: "#aacdf8", // Change this to your desired color
                                    fontWeight: "bold",
                                    fontSize: "80px"
                                }}
                            >
                                Yan
                            </span>
                        </div>
                    </div>
                    
                    <div className="bottom-section"> 
                        ECE Student at The University of Waterloo  
                    </div> 
                    
                    <div className="logo">
                        <Button
                        variant="contained"
                        style={{
                            backgroundColor: "rgba(54, 81, 114, 255)", 
                            color: "white",
                        }}
                        onClick={() => window.open("https://linkedin.com/in/yanxue-ce/", "_blank")}
                        sx = {{ 
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                            ':hover': {
                            transform: 'scale(1.05)', // Slight zoom-in on hover
                            boxShadow: '0 0 2px 4px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                            },
                        }} 
                        >
                        LinkedIn
                        </Button>

                        {/* Resume Button */}
                        <Button
                        variant="outlined"
                        style={{
                            borderColor: "#aacdf8",
                            backgroundColor: "#FFFFFF", 
                            color: "black",
                        }}
                        sx = {{ 
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animation
                            ':hover': {
                            transform: 'scale(1.05)', // Slight zoom-in on hover
                            boxShadow: '0 0 2px 4px rgba(147, 143, 143, 0.5)', // Enhanced shadow on hover
                            },
                        }} 
                        onClick={() => window.open("https://your-resume-link.com", "_blank")} // Replace with your resume link
                        >
                        Resume
                        </Button> 

                        </div>
                        
                    </div>
                </div>    
                </motion.div>  
            
            </section>
    ); 
} 