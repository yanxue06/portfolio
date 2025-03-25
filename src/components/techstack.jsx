import React, { useState } from "react";
import TechBadge from "./TechBadge";
import { Code, Globe, Library, Wrench } from "lucide-react";

const TechStack = ({
  categories = {
    Languages: [
      { name: "Python", color: "#4B8BBE" },
      { name: "C++", color: "#f34b7d" },
      { name: "Java", color: "#f34b7d" },
      { name: "TypeScript", color: "#3178c6" },
      { name: "JavaScript", color: "#f7df1e" },
    ],
    "Developer Tools": [
      { name: "HTML", color: "#e34f26" },
      { name: "CSS", color: "#ff9800" },
      { name: "Supabase", color: "#3ECF8E" },
      { name: "SQL", color: "#00b2a9" },
      { name: "Bash", color: "#4d4d4d" },
    ],
    Frameworks: [
      { name: "React", color: "#61dafb" },
      { name: "Angular", color: "#dd0031" },
      { name: "Node.js", color: "#8bc34a" },
    ],
    Libraries: [
      { name: "OpenCV", color: "#ff3366" },
      { name: "Pandas", color: "#ff9a00" },
      { name: "MatplotLib", color: "#6746c3" },
      { name: "Scikit Learn", color: "#f47b28" },
    ],
  },
}) => {
  const [activeCategory, setActiveCategory] = useState(null);

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
    <div style={{
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
      }
    }}>    
      <div style={{ marginBottom: "24px", textAlign: "left" }}>
        <h2 style={{ 
          fontSize: "clamp(24px, 3vw, 28px)",
          fontWeight: "bold",
          color: "white",
          marginBottom: "16px" 
        }}>Skills</h2>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
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
        }}>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {categories[activeCategory].map((tech, index) => (
              <TechBadge key={`${tech.name}-${index}`} name={tech.name} color={tech.color} icon={tech.icon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStack;
