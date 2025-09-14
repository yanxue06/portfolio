import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Box, Card } from "@chakra-ui/react";

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
    description: "Working on the Developer Experience team, using Rust and OpenAPI to optimize workflows and improve BitGo's API",
    images: [logoPlaceholders["BitGo"]],
    colorAccent: "#65B5FF",
  },
  {
    year: "2025",
    dateRange: "May 2025 - Present",
    company: "UW Blueprint",
    role: "Software Developer",
    location: "Waterloo, ON",
    description: "Building software for NPO Marrilac place that centralizes resident records and support daily tracking programs",
    images: [logoPlaceholders["Blueprint"]],
    colorAccent: "#65B5FF",
  },
  {
    year: "2025",
    dateRange: "Jan 2025 - Present",
    company: "HongMall Canada",
    role: "Software Engineer Intern",
    location: "Markham, ON",
    description: "Built a customer service chatbot to serve 1M+ users and developed a centralized interface for controlling warehouse robots",
    images: [logoPlaceholders["HongMall"]],
    colorAccent: "#65B5FF",
  },
  {
    year: "2023",
    dateRange: "Feb 2023 - Aug 2024",
    company: "Skynet Security System Ltd.",
    role: "Software Engineer Intern",
    location: "Vancouver, BC",
    description: "Developed the company website and created tools for billing and inventory management",
    images: [logoPlaceholders["Skynet Security System Ltd."]],
    colorAccent: "#65B5FF",
  },
];

const ImageRow = ({ images }) => {
  if (!images || images.length === 0) return null;
  
  return (
    <Box
      css={{
        display: "flex",
        gap: "8px",
        marginTop: "12px",
        flexWrap: "wrap",
      }}
    >
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Experience image ${index + 1}`}
          style={{
            height: "32px",
            width: "auto",
            borderRadius: "4px",
            filter: "drop-shadow(0 0 1px rgba(255, 255, 255, 0.3))",
          }}
        />
      ))}
    </Box>
  );
};

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
        fontSize: "0.9rem",
        width: "100%",
        lineHeight: "1.6",
        marginBottom: "0",
      }}
    >
      {parseDescription(description)}
    </p>
  );
};

const CompanyInfo = ({ company, role, colorAccent }) => {
  return (
    <Box
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <Box css={{ flex: 1, minWidth: "200px" }}>
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: "bold",
            color: colorAccent,
            marginBottom: "4px",
            lineHeight: "1.2",
            textShadow: `0 0 15px ${colorAccent}80`,
            background: `linear-gradient(135deg, ${colorAccent} 0%, #FF5A6E 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {role}
        </h3>
        <p
          style={{
            color: "rgb(220, 229, 251)",
            fontSize: "1rem",
            fontWeight: "600",
            opacity: 1,
            width: "100%",
          }}
        >
          {company}
        </p>
      </Box>
    
    </Box>
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
        marginBottom: "60px",
        position: "relative",
      }}
      css={{
        "@media (max-width: 768px)": {
          marginBottom: "40px",
        },
      }}
    >
      <Card.Root
        css={{
          flex: 1,
          marginLeft: "80px",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: `1px solid ${colorAccent}40`,
          borderRadius: "12px",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          backdropFilter: "blur(20px)",
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colorAccent}60, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
          },
          "@media (max-width: 968px)": {
            marginLeft: "70px",
          },
          "@media (max-width: 768px)": {
            marginLeft: "60px",
          },
          "@media (max-width: 480px)": {
            marginLeft: "55px",
          },
        }}
      >
        <Card.Body p="24px">
          {/* Header with logo and company info */}
          <Box
            css={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
              "@media (max-width: 768px)": {
                gap: "12px",
              },
            }}
          >
            {/* Company Logo */}
            {images && images.length > 0 && (
              <Box
                css={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${colorAccent}30`,
                }}
              >
                <img
                  src={images[0]}
                  alt={`${company} logo`}
                  style={{
                    width: "32px",
                    height: "32px",
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
                  fontSize: "1.25rem",
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
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: colorAccent,
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
              gap: "16px",
              marginBottom: "16px",
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.7)",
              "@media (max-width: 768px)": {
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
              },
            }}
          >
            <Box css={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box
                css={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                }}
              />
              <span>{location}</span>
            </Box>
            <Box css={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box
                css={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                }}
              />
              <span>{dateRange}</span>
            </Box>
          </Box>

          {/* Description */}
          <Box
            css={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "0.9rem",
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
          return entryRect.top - timelineRect.top + 20;
        }
        return 80 + (index * 260);
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
    return dotPositions[index] || (80 + (index * 260));
  };

  return (
    <Box
      ref={timelineRef}
      css={{
        position: "relative",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 40px",
        "@media (max-width: 968px)": {
          padding: "40px 30px",
          margin: "0 15px",
        },
        "@media (max-width: 768px)": {
          padding: "40px 20px",
          margin: "0 15px",
        },
        "@media (max-width: 480px)": {
          padding: "40px 15px",
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
              width: "16px",
              height: "16px",
              background: `radial-gradient(circle, ${colorAccent} 0%, ${colorAccent}aa 40%, ${colorAccent}33 70%, transparent 100%)`,
              borderRadius: "50%",
              boxShadow: `0 0 20px ${colorAccent}80`,
              zIndex: 4,
              transform: "translate(-50%, 0)",
              "@media (max-width: 968px)": {
                left: "30px",
                width: "14px",
                height: "14px",
              },
              "@media (max-width: 768px)": {
                left: "20px",
                width: "12px",
                height: "12px",
              },
              "@media (max-width: 480px)": {
                left: "15px",
                width: "10px",
                height: "10px",
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
    <section style={{ width: "100%", padding: "60px 0" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ textAlign: "center", marginBottom: "40px" }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            fontWeight: "bold",
            color: "rgb(196, 223, 235)",
            marginBottom: "16px",
          }}
        >
          Experience
        </h1>
        <p
          style={{
            color: "rgb(220, 229, 251)",
            fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          My professional journey through software engineering, automation, and firmware development
        </p>
      </motion.div>

      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "0 20px",
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
