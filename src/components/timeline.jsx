import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Box, Card } from "@chakra-ui/react";

const logoPlaceholders = {
  BitGo: "/images/logo-placeholder1.svg",
  HongMall: "/images/logos/hongmall.png",
  "Pacific Grace Mandarin Church": "/images/logos/pgmc.png",
  "Midnight Sun": "/images/logos/midnightsun.png",
  "Skynet Security System Ltd.": "/images/logos/skynet.png",
  Rocketry: "/images/logos/rocketry.png",
};

const experiences = [
  {
    year: "2025",
    dateRange: "Sep 2025 - Present",
    company: "BitGo | Palo Alto, CA",
    role: "Software Engineer Intern",
    location: "Palo Alto, CA",
    description: "Working on **Developer Experience** to enhance platform usability. Building tools and infrastructure that *empower developers* to integrate with our cryptocurrency custody platform more efficiently.",
    images: [logoPlaceholders["BitGo"]],
    colorAccent: "#65B5FF",
  },
  {
    year: "2025",
    dateRange: "May 2025 - Present",
    company: "UW Blueprint | Waterloo, ON",
    role: "Software Developer",
    description: "Marrilac Place",
    images: [logoPlaceholders["BitGo"]],
    colorAccent: "#65B5FF",
  },
  {
    year: "2025",
    dateRange: "Jan 2025 - Present",
    company: "HongMall Canada | Markham, ON",
    role: "Software Engineer Intern",
    description: "Developing **e-commerce solutions** and automation systems serving *1M+ customers*. Building scalable web applications and optimizing user experience across the platform.",
    images: [logoPlaceholders["HongMall"]],
    colorAccent: "#FF5A6E",
  },
  {
    year: "2023",
    dateRange: "Feb 2023 - Aug 2024",
    company: "Skynet Security System Ltd. | Vancouver, BC",
    role: "Software Engineer Intern",
    description: "Led development of **automation tools** and web platforms generating *$72,000+ in revenue*. Built full-stack applications and integrated IoT security systems.",
    images: [logoPlaceholders["Skynet Security System Ltd."]],
    colorAccent: "#4CAF50",
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
        color: "rgb(220, 229, 251)",
        fontSize: "0.9rem",
        lineHeight: "1.6",
        marginBottom: "8px",
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
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: colorAccent,
            marginBottom: "4px",
            lineHeight: "1.2",
          }}
        >
          {role}
        </h3>
        <p
          style={{
            color: "rgb(220, 229, 251)",
            fontSize: "0.95rem",
            fontWeight: "500",
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
    >
      <Box
        css={{
          minWidth: "120px",
          textAlign: "right",
          paddingRight: "30px",
          paddingTop: "8px",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: colorAccent,
            marginBottom: "4px",
          }}
        >
          {year}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "rgb(220, 229, 251)",
            opacity: 0.7,
            lineHeight: "1.3",
          }}
        >
          {dateRange}
        </div>
      </Box>

      <Card.Root
        css={{
          flex: 1,
          marginLeft: "30px",
          backgroundColor: "#1e2f3e",
          border: "1px solid rgba(235, 235, 235, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Card.Body p="20px">
          <CompanyInfo
            company={company}
            role={role}
            location={location}
            colorAccent={colorAccent}
          />
          <DescriptionBlock description={description} />
          <ImageRow images={images} />
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
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 20px",
        paddingLeft: "150px",
      }}
    >
      <Box
        css={{
          position: "absolute",
          left: "120px",
          top: "40px",
          bottom: "40px",
          width: "2px",
          backgroundColor: "rgba(220, 229, 251, 0.3)",
          zIndex: 1,
        }}
      />

      <Box
        css={{
          position: "absolute",
          left: "120px",
          top: "40px",
          width: "2px",
          height: `${scrollProgress * 100}%`,
          backgroundColor: "rgba(101, 181, 255, 0.6)",
          transition: "height 0.3s ease-out",
          zIndex: 2,
        }}
      />
              {React.Children.map(children, (child, index) => {
        const colorAccent = experiences[index]?.colorAccent || "#65B5FF";
        return (
          <Box
            key={`dot-${index}`}
            css={{
              position: "absolute",
              left: "120px",
              top: `${getDotPosition(index)}px`,
              width: "16px",
              height: "16px",
              background: `radial-gradient(circle, ${colorAccent} 0%, ${colorAccent}aa 40%, ${colorAccent}33 70%, transparent 100%)`,
              borderRadius: "50%",
              boxShadow: `0 0 20px ${colorAccent}80`,
              zIndex: 4,
              transform: "translate(-50%, 0)",
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
    </section>
  );
};

export default TimeLine;
