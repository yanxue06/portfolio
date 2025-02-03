import * as React from "react";
import "../home.css";
import "../particle.scss";
import "../timeline.css";
import TimeLine from "../components/timeline";
import Intro from "../components/intro";
import About from "../components/about";
import Projects from "../components/projects";
import Arrows from "../components/arrow";
import "../navbar.css";
import gram from '../images/icons/gram.png'
import email from '../images/icons/email.png'
import linkedIn from '../images/icons/linkedIn.png'
import github from '../images/icons/github.png'

export default function App() {
    return (
        <>
            <div className="max-w-[1000px] mx-auto px-4">
                <Arrows />

                <Intro />

                <section className="p2">
                    <About />

                    <TimeLine />
                </section>

                <Projects />

                
                <section id="contact" className="p4">
                    <div className="contactsRow">
                        <div className="contactsCol">
                            <div 
                              style={{
                                fontSize: "30px",
                                color: "rgb(239, 239, 239)",
                                fontWeight: "bold",
                              }}
                            > Contact Me!
                            </div>
                            <div className="contact_description" 
                                style = {{
                                  width: "100%",
                                  fontSize: "15px",
                                  color: "grey"
                                }}
                            >
                                Thanks for checking out my website! 
                                Feel free to contact me, I'm open to 
                                any and all oppurtunities. 
                                
                            

                            </div>
                            <footer
                                style={{
                                    marginTop: "20px",
                                    color: "grey",
                                    textAlign: "center", // Center-align the text
                                    lineHeight: "1.6",   // Adjust line height for readability
                                }}
                            >
                                <p style={{ 
                                    fontSize: "14px", 
                                    marginBottom: "10px" 
                                }}>
                                    Designed in <span style={{ color: "#F24E1E", fontWeight: "bold" }}>Figma</span>, 
                                    built using <span style={{ color: "#61DAFB", fontWeight: "bold" }}>React</span> + 
                                    <span style={{ color: "#646CFF", fontWeight: "bold" }}>Vite</span>, 
                                    deployed with <span style={{ color: "white", fontWeight: "bold" }}>Vercel</span> by 
                                    <span style={{ color: "#FFD700", fontWeight: "bold" }}>Yan Xue</span>.
                                </p>
                                <p style={{ 
                                    fontSize: "14px", 
                                    marginTop: "20px" 
                                }}>
                                    © 2025 <span style={{ color: "#FFD700", fontWeight: "bold" }}>Yan Xue</span>. All rights reserved.
                                </p>
                            </footer>

                        </div>

                        <div className="contactsCol">
                            <div 
                              style={{
                                fontSize: "30px",
                                color: "rgb(239, 239, 239)",
                                fontWeight: "bold",
                                height: "100%"
                              }}
                            > 
                              Socials
                            </div>
                            <div className="contact_list">
                                <div 
                                  style = {{
                                    width: "100%",
                                    display: "flex",
                                    gap: "20px",
                                    marginTop: "10px"
                                  }}
                                > 
                                
                                <a href="https://www.instagram.com/yan._.xue_/" target="_blank" rel="noopener noreferrer">
                                    <img src={gram} alt="instagram" style={{ width: "50px", height: "50px"}}/>
                                </a> 

                                <a href="mailto:y9xue@uwaterloo.ca" target="_blank" rel="noopener noreferrer">
                                    <img src={email} alt="email" style={{ width: "50px", height: "50px"}}/>
                                </a>

                                <a href="https://linkedin.com/in/yanxue-ce" target="_blank" rel="noopener noreferrer">
                                    <img src={linkedIn} alt="linkedIn" style={{ width: "50px", height: "50px"}}/>
                                </a>

                                <a href="https://github.com/yanxue06" target="_blank" rel="noopener noreferrer">
                                    <img src={github} alt="github" style={{ width: "50px", height: "50px"}}/>
                                </a>

                                {/* <a href="mailto:y9xue@uwaterloo.ca" target="_blank" rel="noopener noreferrer">
                                    y9xue@uwaterloo.ca
                                </a>

                                LinkedIn:
                                <a href="https://linkedin.com/in/yanxue-ce" target="_blank" rel="noopener noreferrer">
                                    linkedin.com/in/yanxue-ce
                                </a>

                                GitHub:
                                <a href="https://github.com/yanxue06" target="_blank" rel="noopener noreferrer">
                                    github.com/yanxue06
                                </a> */}
                                
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
