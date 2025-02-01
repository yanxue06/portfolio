import * as React from 'react'; 
import '../home.css';
import '../particle.scss'; 
import '../timeline.css';
import TimeLine from '../components/timeline'
import Intro from '../components/intro'
import About from '../components/about'
import Projects from '../components/projects'
import Arrows from '../components/arrow'
import '../navbar.css';

export default function App() {
  return (
    <>  
      <div className="max-w-[1000px] mx-auto px-4">

        <Arrows/> 
        
        <Intro/> 
        
        <section className="p2">

          <About/> 

          <TimeLine/>

        </section> 
        
        <Projects/> 

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
          <footer
            style={{
              marginLeft: '3%', 
              marginBottom: '1%', 
              textAlign: "left",
              padding: "10px 0",
              color: "grey",
              fontSize: "14px",
            }}
          >
            © 2025 Yan Xue. All rights reserved.
          </footer>
              
        </section> 
      </div>
      
    </>
  );
}
