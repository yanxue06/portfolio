import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() { //react component, returns JSX
  return (
      <div className="p1"> 
        <div className="intro"> 
          <h1> Hey! </h1> 
          <h2> I'm Yan, an Computer Engineering Student at the University of Waterloo</h2>
        </div> 
        {/* <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div> */}
      </div> 
  )
}

export default App //

console.log("hello"); 