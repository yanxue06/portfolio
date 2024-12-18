import React, { useState, useEffect } from "react"; 

function Typewriter({ textArray, speed = 100, delay = 1000}) { 
    const [currentText, setCurrentText] = useState([]); //rerenders component when setCurrentText is called
    const [lineIndex, setLineIndex] = useState(0); //tracks current line of textArray being typed, starts at 0 the first line 

    
    
}