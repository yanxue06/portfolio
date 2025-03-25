import React, { useState } from "react";
import TechBadge from "./techbadge";
import { Code, Globe, Library, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@chakra-ui/react";

const TechStack = ({
  categories = {
    Languages: [
      { name: "Python", color:  "#4d4d4d" },
      { name: "C++", color: "#4d4d4d" },
      { name: "C", color: "#4d4d4d" },
      { name: "Java", color: "#4d4d4d" },
      { name: "TypeScript", color: "#4d4d4d" },
      { name: "JavaScript", color: "#4d4d4d" },
    ],
    // all colors to  "#4d4d4d"
    "Developer Tools": [
      { name: "HTML", color: "#4d4d4d" },
      { name: "CSS", color: "#4d4d4d" },
      { name: "SQL", color: "#4d4d4d" },
      { name: "Git", color: "#4d4d4d" },
      { name: "Supabase", color: "#4d4d4d" },
      { name: "Firebase", color: "#4d4d4d" },
      { name: "Bash", color: "#4d4d4d" },
      { name: "Docker", color: "#4d4d4d" },
      { name: "AWS", color: "#4d4d4d" },
      { name: "VSCode", color: "#4d4d4d" },
      { name: "PyCharm", color: "#4d4d4d" },
      { name: "Cursor", color: "#4d4d4d" },      
    ],
    Frameworks: [
      { name: "React", color:  "#4d4d4d" },
      { name: "Angular", color:  "#4d4d4d" },
      { name: "Node.js", color:  "#4d4d4d" },
      { name: "Express", color: "#4d4d4d" },
      { name: "Flask", color: "#4d4d4d" },
      { name: "Django", color: "#4d4d4d" },
      { name: "FastAPI", color: "#4d4d4d" },
      { name: "REST", color: "#4d4d4d" },
      { name: "GraphQL", color: "#4d4d4d" },
      { name: "Socket.io", color: "#4d4d4d" },
      { name: "Vite", color: "#4d4d4d" },
      { name: "Next.js", color: "#4d4d4d" },
      { name: "Bootstrap", color: "#4d4d4d" },
    ],
    Libraries: [
      { name: "Pandas", color: "#4d4d4d" },
      { name: "OpenCV", color: "#4d4d4d" },
      { name: "MatplotLib", color: "#4d4d4d" },
      { name: "Scikit Learn", color: "#4d4d4d" },
      { name: "Puncc - Conformal Prediction", color: "#4d4d4d" },
    ],
  },
}) => {
  const [activeCategory, setActiveCategory] = useState("Languages");

  const categoryIcons = {
    Languages: <Code size={20} />,
    "Developer Tools": <Wrench size={20} />,
    Frameworks: <Globe size={20} />,
    Libraries: <Library size={20} />,
  };

  const toggleCategory = (categoryName) => {
    if (activeCategory === categoryName) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryName);
    }
  };

  return (
    <section style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Card.Root
          css={{
            width: "70%",
            maxWidth: "1200px", 
            margin: "0 auto", 
            padding: "32px", 
            backgroundColor: "#2B3F57", 
            borderRadius: "8px",
            boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
            },
            "@media (max-width: 780px)": {
              width: "90%",
              padding: "24px 16px",
            }
          }}
        >    
          <Card.Title
            mb="4"
            css={{
              fontSize: "clamp(24px, 3vw, 28px)",
              fontWeight: "bold",
              color: "white",
              textAlign: "left"
            }}
          >
            Skills
          </Card.Title>

          <div 
            style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "16px", 
              marginBottom: "24px"
            }}
            className="category-buttons"
          >
            {Object.entries(categories).map(([categoryName, technologies]) => (
              <button
                key={categoryName}
                onClick={() => toggleCategory(categoryName)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                  backgroundColor: activeCategory === categoryName ? "#1e2f3e" : "#2B3F57",
                  color: "rgb(220, 229, 251)",
                  border: "1px solid rgba(235, 235, 235, 0.2)",
                  transform: activeCategory === categoryName ? "scale(1.05)" : "scale(1)",
                  boxShadow: activeCategory === categoryName ? "0 4px 12px rgba(0, 0, 0, 0.2)" : "none",
                  cursor: "pointer",
                  minWidth: "150px",
                }}
                className={`category-button ${activeCategory === categoryName ? 'active' : ''}`}
              >
                <div style={{ 
                  fontSize: "20px", 
                  marginBottom: "8px",
                  color: "rgb(220, 229, 251)"
                }}>
                  {categoryIcons[categoryName] || <Code size={20} />}
                </div>
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "rgb(220, 229, 251)"
                }}>{categoryName}</span>
              </button>
            ))}
          </div>

          {activeCategory && (
            <div style={{
              backgroundColor: "#1e2f3e",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              padding: "24px",
              transition: "all 0.3s",
              border: "1px solid rgba(235, 235, 235, 0.1)"
            }}
            className="tech-content"
            >
              <h3 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "rgb(220, 229, 251)"
              }}>
                {categoryIcons[activeCategory] && React.cloneElement(categoryIcons[activeCategory], { size: 24 })}
                <span>{activeCategory}</span>
              </h3>
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "12px"
              }}
              className="tech-badges"
              >
                {categories[activeCategory].map((tech, index) => (
                  <TechBadge key={`${tech.name}-${index}`} name={tech.name} color={tech.color} icon={tech.icon} />
                ))}
              </div>
            </div>
          )}
        </Card.Root>
      </motion.div>

      <style jsx>{`
        @media (max-width: 780px) {
          .category-buttons {
            gap: 12px;
          }
          
          .category-button {
            min-width: 120px;
            padding: 10px 12px;
          }
          
          .tech-content {
            padding: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .category-button {
            min-width: 100px;
            padding: 8px 10px;
            flex-grow: 1;
          }
          
          .category-button div {
            font-size: 18px;
            margin-bottom: 6px;
          }
          
          .category-button span {
            font-size: 12px;
          }
          
          .tech-content h3 {
            font-size: 18px;
            margin-bottom: 12px;
          }
          
          .tech-badges {
            gap: 8px;
          }
        }
      `}</style>
    </section>
  );
};

export default TechStack;
