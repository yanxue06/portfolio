import React from "react";
import { Code, Globe, Library, Wrench } from "lucide-react"; // Import icons from lucide-react

const TechBadge = ({ name = "Technology", color = "#3178c6", icon, iconOnly = false }) => {
  // Default icon if no specific icon is provided
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s",
        padding: iconOnly ? "8px" : "12px 16px",
        borderRadius: "8px",
        backgroundColor: "#1e2f3e",
        color: "rgb(220, 229, 251)",
        border: "1px solid " + color + "40",
        boxShadow: `0 0 10px ${color}20`,
        cursor: "pointer",
        transform: "scale(1)",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: `0 0 15px ${color}30`,
        }
      }}
    >
      <span style={{ fontSize: "14px" }}>{name}</span>
    </div>
  );
};

export default TechBadge;
