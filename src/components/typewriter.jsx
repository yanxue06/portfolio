import React, { useState, useEffect } from 'react';

function TypeWriter({text, speed=100}) { 
    //use an array of text, kepe on updating it --> think useState 

    const [showedText, setText] = useState(''); 
    const [index, setIndex] = useState(0); 

    useEffect(() => { 
        
        if (!text || index >= text.length) {  //.length build in for JS  
            return; 
        }

        const timer = setTimeout(() => { //runs once wen called, timer to create delayed affect
            setText((prev) => prev + text[index]); //showedText as argument (called prev), then reassigned with appended
            setIndex((prev) => prev + 1); //PREV is just a placeholder for whatever the current index is 
        }, speed); 

        return () => clearTimeout(timer); //resets timer 
    }, [index]);  //run run when index changes

    return <div>{showedText}</div>; //make sure shows once letter at a time 
}


export default TypeWriter; 