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
                                fontSize: "14px",
                            }}
                            >
                                © 2025 Yan Xue. All rights reserved.
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
                                    fontSize: "15px",
                                    color: "grey"
                                  }}
                                > 
                                  <ul>
                                      <li>
                                          Email:
                                          <a href="mailto:y9xue@uwaterloo.ca">
                                              y9xue@uwaterloo.ca
                                          </a>
                                      </li>
                                      <li>
                                          LinkedIn:
                                          <a href="https://linkedin.com/in/yanxue-ce">
                                              linkedin.com/in/yanxue-ce
                                          </a>
                                      </li>
                                      <li>
                                          GitHub:
                                          <a href="https://github.com/yanxue06">
                                              github.com/yanxue06
                                          </a>
                                      </li>
                                      <li> Resume: </li>
                                  </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
