import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { motion } from 'framer-motion';
import TechBadge from './techbadge';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tech-tabpanel-${index}`}
      aria-labelledby={`tech-tab-${index}`}
      {...other}
      style={{ 
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'flex-start',
        '@media (max-width: 780px)': {
          flexDirection: 'column',
          alignItems: 'flex-start',
        }
      }}
    >
      {value === index && children}
    </div>
  );
}

export default function TechStack() {
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 780);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 780);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSelectChange = (event) => {
    setValue(event.target.value);
  };

  const categories = {
    Languages: [
      { name: "Python", color: "#4d4d4d" },
      { name: "C++", color: "#4d4d4d" },
      { name: "C", color: "#4d4d4d" },
      { name: "Java", color: "#4d4d4d" },
      { name: "TypeScript", color: "#4d4d4d" },
      { name: "JavaScript", color: "#4d4d4d" },
    ],
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
      { name: "React", color: "#4d4d4d" },
      { name: "Angular", color: "#4d4d4d" },
      { name: "Node.js", color: "#4d4d4d" },
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
  };

  const tabLabels = ["Languages", "Frameworks", "Libraries", "Developer Tools"];

  return (
    <section style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Box sx={{ 
          width: '70%', 
          maxWidth: "1200px",
          bgcolor: 'rgb(15, 27, 36)', 
          margin: '0 auto',
          backgroundColor: "#2B3F57",
          borderRadius: "8px",
          boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
          },
          "@media (max-width: 1500px)": {
            width: "90% !important",
          },
          "@media (max-width: 780px)": {
            width: "90%",
            padding: "24px 16px",
          },
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {isMobile ? (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={value}
                  onChange={handleSelectChange}
                  sx={{
                    color: 'rgb(220, 229, 251)',
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(235, 235, 235, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(235, 235, 235, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgb(196, 223, 235)',
                    },
                    '& .MuiSelect-icon': {
                      color: 'rgb(220, 229, 251)',
                    },
                  }}
                >
                  {tabLabels.map((label, index) => (
                    <MenuItem 
                      key={label} 
                      value={index}
                      sx={{
                        color: 'rgb(0, 0, 0)',
                        '&.Mui-selected': {
                          color: 'rgb(55, 109, 167)',
                          backgroundColor: 'rgba(196, 223, 235, 0.1)',
                        },
                      }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Tabs 
                value={value} 
                onChange={handleChange} 
                variant="fullWidth"
                sx={{
                  backgroundColor: "#161D25",
                  '& .MuiTab-root': {
                    color: 'rgb(220, 229, 251)',
                    fontSize: '14px',
                    fontWeight: '500',
                    '&.Mui-selected': {
                      color: 'rgb(196, 223, 235)',
                      fontWeight: 'bold',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'rgb(196, 223, 235)',
                  },
                }}
              >
                {tabLabels.map((label) => (
                  <Tab key={label} label={label} />
                ))}
              </Tabs>
            )}
          </Box>
          
          <TabPanel value={value} index={0}>
            {categories.Languages.map((tech, index) => (
              <TechBadge
                key={`${tech.name}-${index}`}
                name={tech.name}
                color={tech.color}
                icon={tech.icon}
              />
            ))}
          </TabPanel>
          
          <TabPanel value={value} index={1}>
            {categories.Frameworks.map((tech, index) => (
              <TechBadge
                key={`${tech.name}-${index}`}
                name={tech.name}
                color={tech.color}
                icon={tech.icon}
              />
            ))}
          </TabPanel>
          
          <TabPanel value={value} index={2}>
            {categories.Libraries.map((tech, index) => (
              <TechBadge
                key={`${tech.name}-${index}`}
                name={tech.name}
                color={tech.color}
                icon={tech.icon}
              />
            ))}
          </TabPanel>
          
          <TabPanel value={value} index={3}>
            {categories["Developer Tools"].map((tech, index) => (
              <TechBadge
                key={`${tech.name}-${index}`}
                name={tech.name}
                color={tech.color}
                icon={tech.icon}
              />
            ))}
          </TabPanel>
        </Box>
      </motion.div>
    </section>
  );
}


// import React, { useState, useEffect } from "react";
// import TechBadge from "./techbadge";
// import { Code, Globe, Library, Wrench } from "lucide-react";
// import { motion } from "framer-motion";
// import { Card } from "@chakra-ui/react";
// import { useTheme } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import OutlinedInput from "@mui/material/OutlinedInput";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import Select from "@mui/material/Select";
// import Chip from "@mui/material/Chip";

// const TechStack = ({
//   categories = {
//     Languages: [
//       { name: "Python", color: "#4d4d4d" },
//       { name: "C++", color: "#4d4d4d" },
//       { name: "C", color: "#4d4d4d" },
//       { name: "Java", color: "#4d4d4d" },
//       { name: "TypeScript", color: "#4d4d4d" },
//       { name: "JavaScript", color: "#4d4d4d" },
//     ],
//     // all colors to  "#4d4d4d"
//     "Developer Tools": [
//       { name: "HTML", color: "#4d4d4d" },
//       { name: "CSS", color: "#4d4d4d" },
//       { name: "SQL", color: "#4d4d4d" },
//       { name: "Git", color: "#4d4d4d" },
//       { name: "Supabase", color: "#4d4d4d" },
//       { name: "Firebase", color: "#4d4d4d" },
//       { name: "Bash", color: "#4d4d4d" },
//       { name: "Docker", color: "#4d4d4d" },
//       { name: "AWS", color: "#4d4d4d" },
//       { name: "VSCode", color: "#4d4d4d" },
//       { name: "PyCharm", color: "#4d4d4d" },
//       { name: "Cursor", color: "#4d4d4d" },
//     ],
//     Frameworks: [
//       { name: "React", color: "#4d4d4d" },
//       { name: "Angular", color: "#4d4d4d" },
//       { name: "Node.js", color: "#4d4d4d" },
//       { name: "Express", color: "#4d4d4d" },
//       { name: "Flask", color: "#4d4d4d" },
//       { name: "Django", color: "#4d4d4d" },
//       { name: "FastAPI", color: "#4d4d4d" },
//       { name: "REST", color: "#4d4d4d" },
//       { name: "GraphQL", color: "#4d4d4d" },
//       { name: "Socket.io", color: "#4d4d4d" },
//       { name: "Vite", color: "#4d4d4d" },
//       { name: "Next.js", color: "#4d4d4d" },
//       { name: "Bootstrap", color: "#4d4d4d" },
//     ],
//     Libraries: [
//       { name: "Pandas", color: "#4d4d4d" },
//       { name: "OpenCV", color: "#4d4d4d" },
//       { name: "MatplotLib", color: "#4d4d4d" },
//       { name: "Scikit Learn", color: "#4d4d4d" },
//       { name: "Puncc - Conformal Prediction", color: "#4d4d4d" },
//     ],
//   },
// }) => {
//   const [activeCategory, setActiveCategory] = useState("Languages");
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 1050);
//     };

//     // Initial check
//     checkIfMobile();

//     // Add event listener
//     window.addEventListener("resize", checkIfMobile);

//     // Clean up
//     return () => window.removeEventListener("resize", checkIfMobile);
//   }, []);

//   const categoryIcons = {
//     Languages: <Code size={20} />,
//     "Developer Tools": <Wrench size={20} />,
//     Frameworks: <Globe size={20} />,
//     Libraries: <Library size={20} />,
//   };

//   const toggleCategory = (categoryName) => {
//     if (activeCategory === categoryName) {
//       setActiveCategory(null);
//     } else {
//       setActiveCategory(categoryName);
//     }
//   };

//   const handleCategoryChange = (event) => {
//     setActiveCategory(event.target.value);
//   };

//   return (
//     <section style={{ width: "100%" }}>
//       <motion.div
//         initial={{ x: -40, opacity: 0 }}
//         whileInView={{ x: 0, opacity: 1 }}
//         transition={{ duration: 1 }}
//         viewport={{ once: true, amount: 0.2 }}
//         style={{ width: "100%", display: "flex", justifyContent: "center" }}
//       >
//         <Card.Root
//           css={{
//             width: "70%",
//             maxWidth: "1200px",
//             margin: "0 auto",
//             padding: "32px",
//             backgroundColor: "#2B3F57",
//             borderRadius: "8px",
//             boxShadow: "0 0 2px 1px rgba(235, 235, 235, 0.4)",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease",
//             "&:hover": {
//               transform: "scale(1.02)",
//               boxShadow: "0 0 5px 5px rgba(147, 143, 143, 0.5)",
//             },
//             "@media (max-width: 1500px)": {
//               width: "90% !important",
//             },
//             "@media (max-width: 780px)": {
//               width: "90%",
//               padding: "24px 16px",
//             },
//           }}
//         >
//           <Card.Title
//             mb="4"
//             css={{
//               fontSize: "clamp(24px, 3vw, 28px)",
//               fontWeight: "bold",
//               textAlign: "left",
//             }}
//           >
//             <h1 style={{ color: "rgb(196, 223, 235)", marginBottom: "10px" }}>
//               Skills
//             </h1>
//           </Card.Title>

//           {isMobile ? (
//             <FormControl
//               fullWidth
//               sx={{
//                 marginBottom: "24px",
//                 "& .MuiOutlinedInput-root": {
//                   backgroundColor: "#1e2f3e",
//                   color: "rgb(220, 229, 251)",
//                   borderRadius: "8px",
//                   border: "1px solid rgba(235, 235, 235, 0.2)",
//                 },
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "rgba(235, 235, 235, 0.2)",
//                 },
//                 "& .MuiInputLabel-root": {
//                   color: "rgb(220, 229, 251)",
//                 },
//                 "& .MuiSelect-icon": {
//                   color: "rgb(220, 229, 251)",
//                 },
//                 "& .MuiMenuItem-root": {
//                   color: "rgb(220, 229, 251)",
//                   backgroundColor: "#1e2f3e",
//                 },
//               }}
//             >
//               <InputLabel
//                 id="category-select-label"
//                 sx={{ color: "rgb(220, 229, 251)" }}
//               >
//                 {" "}
//                 Categories
//               </InputLabel>
//               <Select
//                 labelId="category-select-label"
//                 id="category-select"
//                 value={activeCategory}
//                 onChange={handleCategoryChange}
//                 label="Category"
//                 sx={{
//                   color: "rgb(220, 229, 251)",
//                   "& .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "rgba(235, 235, 235, 0.2)",
//                   },
//                 }}
//                 MenuProps={{
//                   PaperProps: {
//                     sx: {
//                       backgroundColor: "#1e2f3e",
//                       color: "rgb(220, 229, 251)",
//                     },
//                   },
//                 }}
//               >
//                 {Object.keys(categories).map((categoryName) => (
//                   <MenuItem
//                     key={categoryName}
//                     value={categoryName}
//                     sx={{
//                       backgroundColor: "#1e2f3e",
//                       color: "rgb(220, 229, 251)",
//                       "&:hover": {
//                         backgroundColor: "#2B3F57",
//                       },
//                       "&.Mui-selected": {
//                         backgroundColor: "#2B3F57",
//                       },
//                     }}
//                   >
//                     {categoryName}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           ) : (
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: "16px",
//                 marginBottom: "24px",
//               }}
//               className="category-buttons"
//             >
//               {Object.entries(categories).map(
//                 ([categoryName, technologies]) => (
//                   <button
//                     key={categoryName}
//                     onClick={() => toggleCategory(categoryName)}
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       padding: "12px 16px",
//                       borderRadius: "8px",
//                       transition: "all 0.2s",
//                       backgroundColor:
//                         activeCategory === categoryName ? "#1e2f3e" : "#2B3F57",
//                       color: "rgb(220, 229, 251)",
//                       border: "1px solid rgba(235, 235, 235, 0.2)",
//                       transform:
//                         activeCategory === categoryName
//                           ? "scale(1.05)"
//                           : "scale(1)",
//                       boxShadow:
//                         activeCategory === categoryName
//                           ? "0 4px 12px rgba(0, 0, 0, 0.2)"
//                           : "none",
//                       cursor: "pointer",
//                       minWidth: "150px",
//                     }}
//                     className={`category-button ${activeCategory === categoryName ? "active" : ""}`}
//                   >
//                     <span
//                       style={{
//                         fontSize: "14px",
//                         fontWeight: "500",
//                         color: "rgb(220, 229, 251)",
//                       }}
//                     >
//                       {categoryName}
//                     </span>
//                   </button>
//                 ),
//               )}
//             </div>
//           )}

//           {activeCategory && (
//             <div
//               style={{
//                 backgroundColor: "#1e2f3e",
//                 borderRadius: "8px",
//                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//                 padding: "32px",
//                 transition: "all 0.3s",
//                 border: "1px solid rgba(235, 235, 235, 0.1)",
//               }}
//               className="tech-content"
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: "16px",
//                 }}
//                 className="tech-badges"
//               >
//                 {categories[activeCategory].map((tech, index) => (
//                   <TechBadge
//                     key={`${tech.name}-${index}`}
//                     name={tech.name}
//                     color={tech.color}
//                     icon={tech.icon}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </Card.Root>
//       </motion.div>

//       <style jsx>{`
//         @media (max-width: 1200px) {
//           .category-buttons {
//             @media (max-width: 780px) {
//               .category-buttons {
//                 gap: 12px;
//               }

//               .category-button {
//                 min-width: 120px;
//                 padding: 10px 12px;
//               }

//               .tech-content {
//                 padding: 16px;
//               }
//             }

//             @media (max-width: 480px) {
//               .category-button {
//                 min-width: 100px;
//                 padding: 8px 10px;
//                 flex-grow: 1;
//               }

//               .category-button div {
//                 font-size: 18px;
//                 margin-bottom: 6px;
//               }

//               .category-button span {
//                 font-size: 12px;
//               }

//               .tech-content h3 {
//                 font-size: 18px;
//                 margin-bottom: 12px;
//               }

//               .tech-badges {
//                 gap: 8px;
//               }
//             }
//           }
//         }
//       `}</style>
//     </section>
//   );
// };

// export default TechStack;



