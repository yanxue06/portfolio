import React from "react";
import TypeIt from "typeit-react";

const Typewriter = () => {
  return (
    <TypeIt
      options={{
        speed: 50,
        deleteSpeed: 50,
        loop: true,
        waitUntilVisible: true,
      }}
      getBeforeInit={(instance) => {
        instance
          .type("Hello! ")
          .pause(1500)
          .delete(20) // Deletes "Hello, I'm"
          .type("Bonjour! ")
          .pause(1500)
          .delete(20) // Deletes "Bonjour, I'm"
          .type("你好! ")
          .pause(1500)
          .delete(20) // Deletes "你好, I'm"
          .type("Hola! ")
          .pause(1500)
          .delete(20) // Deletes "Hola, I'm"
          .type("안녕하세요! ")
          .pause(1500)
          .delete(20); // Deletes "안녕하세요, I'm"

        return instance;
      }}
    >
      
    </TypeIt>
  );
};

export default Typewriter;
