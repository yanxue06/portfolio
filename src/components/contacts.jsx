import React from "react";
import "../styles/contacts.css";
import { SiX, SiLinkedin, SiGithub, SiDiscord, SiInstagram, SiSpotify } from "react-icons/si";

export default function Contacts() {
  return (
    <section id="contact" className="p4">
      <div className="contactsRow">
        <div className="contactsCol">
          <div
            className="contact_description"
            style={{
              width: "100%",
              fontSize: "15px",
              color: "grey",
            }}
          >
            Always open to chat! Feel free to reach out: <a href="mailto:yan.xue@uwaterloo.ca" style={{ textDecoration: "underline" }}>yan.xue@uwaterloo.ca</a> 
          </div>
          <footer
            style={{
              marginTop: "20px",
              color: "grey",
              lineHeight: "1.6", // Adjust line height for readability
            }}
          >
             <div className="copyRight">
                © 2025{" "}
                <span style={{ color: "rgb(80, 151, 202)", fontWeight: "bold" }}>
                  Yan Xue.{ " " }
                </span>
                Waterloo, ON.
              </div>
          </footer>
        </div>

        <div className="contactsCol">
          <div
            style={{
              fontSize: "30px",
              color: "rgb(239, 239, 239)",
              fontWeight: "bold",
              height: "100%",
            }}
          >
            Socials
          </div>
          <div className="contact_list">
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: "15px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >

              <a
                href="https://linkedin.com/in/yanxue-ce"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-container"
              >
                <SiLinkedin size={24} />
              </a>

              <a
                href="https://github.com/yanxue06"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-container"
              >
                <SiGithub size={24} />
              </a>

              <a
                href="https://discord.com/users/yamfries7818"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-container"
              >
                <SiDiscord size={24} />
              </a>

              <a
                href="https://www.instagram.com/yanxue06/"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-container"
              >
                <SiInstagram size={24} />
              </a>

              <a
                href="https://open.spotify.com/user/xwc3vx2gkmf3737ajz5o5ki9y"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-container"
              >
                <SiSpotify size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
