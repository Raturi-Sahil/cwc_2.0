import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
      axios.get('/api/jokes')
      .then((response) => {
        console.log(response);
        setJokes(response.data.jokes);
      })
      .catch(error => {
        console.log(error);
      })
    
  }, []);

  return (
    <>
    <h1>Frontend and Backend</h1>
    <p>Jokes: {jokes.length}</p>
    {
      jokes.map((joke, index) => (
        <div key= {joke.id}>
          <h3>{joke.type}</h3>
          <p>{joke.joke}</p>
        </div>
      ))
    }
    </>
  )
}

export default App
