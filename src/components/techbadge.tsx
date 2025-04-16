import React from "react";
import { Code, Globe, Library, Wrench } from "lucide-react"; // Import icons from lucide-react

const TechBadge = ({
  name = "Technology",
  color = "#3178c6",
  icon,
  iconOnly = false,
}) => {
  // Default icon if no specific icon is provided
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s",
        padding: iconOnly ? "8px" : "10px 14px",
        borderRadius: "8px",
        backgroundColor: "#1e2f3e",
        color: "rgb(220, 229, 251)",
        border: "1px solid " + color + "40",
        boxShadow: `0 0 10px ${color}20`,
        cursor: "pointer",
        transform: "scale(1)",
        fontSize: "13px",
        "@media (max-width: 480px)": {
          padding: "8px 12px",
          fontSize: "12px",
        },
      }}
    >
      <span>{name}</span>
    </div>
  );
};

export default TechBadge;
