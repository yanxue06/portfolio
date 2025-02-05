import React from 'react';
import '../styles/techstack.css';

const data = {
  Languages: [
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'Python', color: '#4B8BBE' },
    { name: 'C++', color: '#f34b7d' },
    { name: 'Java', color: '#f34b7d' },
  ],
  "Developer Tools": [
    { name: 'Bash', color: '#4d4d4d' },
    { name: 'HTML', color: '#e34f26' },
    { name: 'CSS', color: '#ff9800' },
    { name: 'SQL', color: '#00b2a9' },
  ],
  Frameworks: [
    { name: 'React', color: '#61dafb' },
    { name: 'Angular', color: '#dd0031' },
    { name: 'Node.js', color: '#8bc34a' },
  ],
  Libraries: [
    { name: 'OpenCV', color: '#ff3366' },
    { name: 'Pandas', color: '#ff9a00' },
    { name: 'MatplotLib', color: '#6746c3' },
    { name: 'Scikit Learn', color: '#f47b28' },

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
