import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Box, Card } from "@chakra-ui/react";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';

const logoPlaceholders = {
  BitGo: "/images/logos/bitgo.jpeg",
  Blueprint: "/images/logos/blueprint.png",
  HongMall: "/images/logos/hongmall.png",
  "Skynet Security System Ltd.": "/images/logos/skynet.png",
};

const experiences = [
  {
    year: "2025",
    dateRange: "Sep 2025 - Present",
    company: "BitGo",
    role: "Software Engineer Intern",
    location: "Palo Alto, CA",
    description: "Working on the Developer Experience team, using Rust to ensure quality in BitGo's API specs",
    images: [logoPlaceholders["BitGo"]],
    colorAccent: "#4A9FE8", // Deep blue
  },
  {
    year: "2025",
    dateRange: "May 2025 - Present",
    company: "UW Blueprint",
    role: "Software Developer",
    location: "Waterloo, ON",
    description: "Building software for NPO Marrilac place that centralizes resident records and support daily tracking programs",
    images: [logoPlaceholders["Blueprint"]],
    colorAccent: "#5CB5FF", // Bright blue
  },
  {
    year: "2025",
    dateRange: "Jan 2025 - Present",
    company: "HongMall Canada",
    role: "Software Engineer Intern",
    location: "Markham, ON",
    description: "Built a customer service chatbot to serve 1M+ users and developed a centralized interface for controlling warehouse robots",
    images: [logoPlaceholders["HongMall"]],
    colorAccent: "#70C5FF", // Sky blue
  },
  {
    year: "2023",
    dateRange: "Feb 2023 - Aug 2024",
    company: "Skynet Security System Ltd.",
    role: "Software Engineer Intern",
    location: "Vancouver, BC",
    description: "Developed the company website and created tools for billing and inventory management",
    images: [logoPlaceholders["Skynet Security System Ltd."]],
    colorAccent: "#85D5FF", // Light sky blue
  },
];



const DescriptionBlock = ({ description }) => {
  const parseDescription = (text) => {
    const parts = [];
    let currentIndex = 0;
    let partIndex = 0;

    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;

    const allMatches = [];
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'bold',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      });
          }

    const textWithoutBold = text.replace(/\*\*(.*?)\*\*/g, (match, content) => '•'.repeat(match.length));
    while ((match = italicRegex.exec(textWithoutBold)) !== null) {
      allMatches.push({
        type: 'italic',
        start: match.index,
        end: match.index + match[0].length,
        content: text.slice(match.index + 1, match.index + match[0].length - 1)
      });
          }

    allMatches.sort((a, b) => a.start - b.start);

    allMatches.forEach((matchObj) => {
      if (currentIndex < matchObj.start) {
        parts.push(
          <span key={partIndex++}>
            {text.slice(currentIndex, matchObj.start)}
          </span>
        );
      }
      if (matchObj.type === 'bold') {
        parts.push(
          <strong key={partIndex++} style={{ color: "#65B5FF" }}>
            {matchObj.content}
          </strong>
        );
      } else if (matchObj.type === 'italic') {
        parts.push(
          <em key={partIndex++} style={{ color: "#FFA94D" }}>
            {matchObj.content}
          </em>
        );
      }

      currentIndex = matchObj.end;
    });
    if (currentIndex < text.length) {
      parts.push(
        <span key={partIndex++}>
          {text.slice(currentIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <p
      style={{
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "0.85rem",
        width: "100%",
        lineHeight: "1.6",
        marginBottom: "0",
      }}
    >
      {parseDescription(description)}
    </p>
  );
};


const TimelineEntry = React.forwardRef(({ year, dateRange, company, role, location, description, images, colorAccent, index, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      {...props}
      initial={{ x: 50, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        marginBottom: "45px",
        position: "relative",
      }}
      css={{
        "@media (max-width: 768px)": {
          marginBottom: "35px",
        },
        "@media (max-width: 480px)": {
          marginBottom: "30px",
        },
      }}
    >
      <Card.Root
        css={{
          flex: 1,
          marginLeft: "80px",

          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.35),
            0 2px 8px rgba(0,0,0,0.25),
            inset 0 1px 1px rgba(255,255,255,0.3),
            inset 0 -1px 1px rgba(0,0,0,0.2)
          `,

          // Liquid glass shimmer effect with unique positioning and more visible tinting
          "&::before": {
            content: "''",
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              radial-gradient(700px 300px at ${index % 2 === 0 ? '-8%' : '108%'} -10%, ${colorAccent}50 0%, transparent 50%),
              radial-gradient(550px 250px at ${index % 2 === 0 ? '112%' : '-12%'} 105%, rgba(255,255,255,0.16) 0%, transparent 50%),
              linear-gradient(${135 + (index * 15)}deg, transparent 0%, ${colorAccent}15 35%, transparent 65%)
            `,
            opacity: 1,
          },
          
          // Top glass reflection with subtle variation
          "&::after": {
            content: "''",
            position: "absolute",
            top: 0,
            left: "12%",
            right: "12%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)",
            opacity: 0.75,
            pointerEvents: "none",
            borderRadius: "50%",
          },

          // Smooth hover transitions with enhanced effects
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s ease",
          "&:hover": {
            transform: "translateY(-8px) translateX(4px)",
            borderColor: `${colorAccent}55`,
            boxShadow: `
              0 20px 50px rgba(0,0,0,0.5),
              0 8px 20px rgba(0,0,0,0.35),
              0 0 0 1px ${colorAccent}75,
              inset 0 0 35px ${colorAccent}22,
              inset 0 2px 2px rgba(255,255,255,0.4)
            `,
          },

          // Fallback when backdrop-filter isn't supported
          "@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))": {
            background: "rgba(15, 23, 42, 0.9)",
          },

          // Responsive offsets
          "@media (max-width: 968px)": { marginLeft: "70px" },
          "@media (max-width: 768px)": { marginLeft: "60px" },
          "@media (max-width: 480px)": { marginLeft: "55px" },
        }}
      >

        <Card.Body p="20px">
          {/* Header with logo and company info */}
          <Box
            css={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "14px",
              "@media (max-width: 768px)": {
                gap: "10px",
                marginBottom: "12px",
              },
            }}
          >
            {/* Company Logo */}
            {images && images.length > 0 && (
              <Box
                css={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${colorAccent}30`,
                  "@media (max-width: 768px)": {
                    width: "36px",
                    height: "36px",
                  },
                }}
              >
                <img
                  src={images[0]}
                  alt={`${company} logo`}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "4px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
            
            {/* Company and Role Info */}
            <Box css={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "2px",
                  lineHeight: "1.3",
                }}
              >
                {company}
              </h3>
              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  color: "#65B5FF",
                  marginBottom: "0",
                  lineHeight: "1.3",
                }}
              >
                {role}
              </p>
            </Box>
          </Box>

          {/* Location and Date */}
          <Box
            css={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
              fontSize: "0.95rem",
              color: "rgba(255, 255, 255, 0.7)",
              "@media (max-width: 768px)": {
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                fontSize: "0.85rem",
              },
            }}
          >   
            <div style={{ display: "flex", alignItems: "center" }}>
              <LocationOnIcon style={{ marginRight: "4px", fontSize: "0.95rem" }} />
              <span>{location}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <DateRangeIcon style={{ marginRight: "4px", fontSize: "0.95rem" }} />
              <span>{dateRange}</span>
            </div>

          </Box>

          {/* Description */}
          <Box
            css={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "1rem",
              lineHeight: "1.6",
            }}
          >
            <DescriptionBlock description={description} />
          </Box>
        </Card.Body>
      </Card.Root>
    </motion.div>
  );
});

const TimelineContainer = ({ children }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);
  const [dotPositions, setDotPositions] = useState([]);
  const timelineRef = useRef(null);
  const entryRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const timelineHeight = rect.height;
        
        // Calculate scroll progress within the timeline
        const scrollTop = -rect.top;
        const viewportCenter = windowHeight / 2;
        const progress = Math.max(0, Math.min(1, (scrollTop + viewportCenter) / timelineHeight));
        
        setScrollProgress(progress);
      }
    };
    const observerOptions = {
      threshold: 0.5,
      rootMargin: "-50% 0px -50% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'));
          setActiveEntryIndex(index);
        }
      });
          }, observerOptions);

    entryRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    const updateDotPositions = () => {
      const positions = entryRefs.current.map((ref, index) => {
        if (ref && timelineRef.current) {
          const entryRect = ref.getBoundingClientRect();
          const timelineRect = timelineRef.current.getBoundingClientRect();
          // Align with card padding (20px) + half the logo height (20px) = 40px
          // But we need to account for the actual rendered position
          return entryRect.top - timelineRect.top + 30;
        }
        // Fallback: initial padding + (index * approximate entry height)
        return 35 + (index * 180);
      });
      setDotPositions(positions);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateDotPositions);
    handleScroll();
    setTimeout(updateDotPositions, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateDotPositions);
      observer.disconnect();
    };
      }, []);
  const getDotPosition = (index) => {
    return dotPositions[index] || (35 + (index * 180));
  };

  return (
    <Box
      ref={timelineRef}
      css={{
        position: "relative",
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "35px 35px",
        "@media (max-width: 968px)": {
          padding: "35px 28px",
          margin: "0 15px",
        },
        "@media (max-width: 768px)": {
          padding: "30px 20px",
          margin: "0 12px",
        },
        "@media (max-width: 480px)": {
          padding: "25px 15px",
          margin: "0 10px",
        },
      }}
    >
      <Box
        css={{
          position: "absolute",
          left: "40px",
          top: "40px",
          bottom: "40px",
          width: "2px",
          backgroundColor: "rgba(220, 229, 251, 0.3)",
          zIndex: 1,
          "@media (max-width: 968px)": {
            left: "30px",
          },
          "@media (max-width: 768px)": {
            left: "20px",
            width: "1px",
          },
          "@media (max-width: 480px)": {
            left: "15px",
          },
        }}
      />

      <Box
        css={{
          position: "absolute",
          left: "40px",
          top: "40px",
          width: "2px",
          height: `${scrollProgress * 100}%`,
          maxHeight: "calc(100% - 80px)",
          backgroundColor: "rgba(101, 181, 255, 0.6)",
          transition: "height 0.3s ease-out",
          zIndex: 2,
          "@media (max-width: 968px)": {
            left: "30px",
          },
          "@media (max-width: 768px)": {
            left: "20px",
            width: "1px",
          },
          "@media (max-width: 480px)": {
            left: "15px",
          },
        }}
      />
              {React.Children.map(children, (child, index) => {
        const colorAccent = experiences[index]?.colorAccent || "#65B5FF";
        return (
          <Box
            key={`dot-${index}`}
            css={{
              position: "absolute",
              left: "40px",
              top: `${getDotPosition(index)}px`,
              width: "14px",
              height: "14px",
              background: `radial-gradient(circle, ${colorAccent} 0%, ${colorAccent}aa 40%, ${colorAccent}33 70%, transparent 100%)`,
              borderRadius: "50%",
              boxShadow: `0 0 18px ${colorAccent}80`,
              zIndex: 4,
              transform: "translate(-50%, 0)",
              "@media (max-width: 968px)": {
                left: "30px",
                width: "12px",
                height: "12px",
              },
              "@media (max-width: 768px)": {
                left: "20px",
                width: "10px",
                height: "10px",
              },
              "@media (max-width: 480px)": {
                left: "15px",
                width: "9px",
                height: "9px",
              },
            }}
          />
        );
      })}

      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          ref: (el) => (entryRefs.current[index] = el),
          'data-index': index,
        })
      )}
    </Box>
  );
};


const TimeLine = () => {
  return (
    <section style={{ width: "100%", padding: "50px 0"}}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ textAlign: "center", marginBottom: "35px" }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.8rem)",
            fontWeight: "bold",
            color: "rgb(196, 223, 235)",
            marginBottom: "14px",
          }}
        >
          Work <span style={{
                background: "linear-gradient(90deg, #63d0f8, #65b5ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Experience</span>
        </h1>
      
      </motion.div>

      <div style={{ 
        maxWidth: "1000px", 
        margin: "0 auto", 
        padding: "0 18px",
        width: "100%" 
      }}>
        <TimelineContainer>
          {experiences.map((exp, index) => (
            <TimelineEntry
              key={index}
              index={index}
              year={exp.year}
              dateRange={exp.dateRange}
              company={exp.company}
              role={exp.role}
              location={exp.location}
              description={exp.description}
              images={exp.images}
              colorAccent={exp.colorAccent}
            />
          ))}
        </TimelineContainer>
      </div>
    </section>
  );
};

export default TimeLine;
