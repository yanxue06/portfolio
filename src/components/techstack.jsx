import React from 'react';
import '../techstack.css';

const data = {
  Languages: [
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'Python', color: '#4B8BBE' },
    { name: 'C++', color: '#f34b7d' },
    { name: 'Go', color: '#29beb0' },
    { name: 'Bash', color: '#4d4d4d' },
    { name: 'HTML', color: '#e34f26' },
    { name: 'CSS', color: '#ff9800' },
    { name: 'SQL', color: '#00b2a9' },
  ],
  "Developer Tools": [
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'Python', color: '#4B8BBE' },
    { name: 'C++', color: '#f34b7d' },
    { name: 'Go', color: '#29beb0' },
    { name: 'Bash', color: '#4d4d4d' },
    { name: 'HTML', color: '#e34f26' },
    { name: 'CSS', color: '#ff9800' },
    { name: 'SQL', color: '#00b2a9' },
  ],
  Frameworks: [
    { name: 'React', color: '#61dafb' },
    { name: 'Angular', color: '#dd0031' },
    { name: 'LitElement', color: '#9b59b6' },
    { name: 'Three.js', color: '#f9c74f' },
    { name: 'Node.js', color: '#8bc34a' },
    { name: 'Express', color: '#858585' },
    { name: 'Jest', color: '#c63d14' },
    { name: 'Unity', color: '#4B0082' },
    { name: 'Qt', color: '#32f05f' },
  ],
  Libraries: [
    { name: 'Figma', color: '#ff3366' },
    { name: 'Illustrator', color: '#ff9a00' },
    { name: 'Procreate', color: '#6746c3' },
    { name: 'Houdini', color: '#f47b28' },
    { name: 'Motion 5', color: '#ff3366' },
    { name: 'Autodesk Inventor', color: '#ff9a00' },
    { name: 'MS PowerPoint', color: '#d24726' },
  ],

};

function TechStack() {
  return (
    <div className="tech-stack-container">
      {Object.entries(data).map(([category, skills]) => (
        <div className="category-block" key={category}>
          <h2 className="category-title">{category}</h2>
          <div className="chip-container">
            {skills.map(({ name, color }) => (
              <span
                className="chip"
                key={name}
                style={{ backgroundColor: color ? `${color}20` : '#eee' }}
              >
                <span
                  className="chip-text"
                  style={{ color: color || '#333' }}
                >
                  {name}
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TechStack;
