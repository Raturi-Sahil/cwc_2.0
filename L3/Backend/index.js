import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();

// await import('dotenv').then(dotenv => dotenv.config());

const PORT  = process.env.PORT || 5000;



app.get('/', (req, res)=> {
    res.status(200).json({msg: "At home route"});
});

app.get('/api/jokes', (req, res) => {
    res.send({
  "jokes": [
    {
      "id": 1,
      "type": "programming",
      "joke": "Why do programmers prefer dark mode? Because light attracts bugs."
    },
    {
      "id": 2,
      "type": "general",
      "joke": "Why don’t skeletons fight each other? They don’t have the guts."
    },
    {
      "id": 3,
      "type": "pun",
      "joke": "I’m reading a book on anti-gravity. It’s impossible to put down!"
    },
    {
      "id": 4,
      "type": "dad",
      "joke": "I only know 25 letters of the alphabet. I don't know y."
    },
    {
      "id": 5,
      "type": "tech",
      "joke": "Why was the computer cold? It left its Windows open."
    }
  ]
})
});


app.listen(PORT, ()=> {
    console.log(`Serve at http://localhost:${PORT}`);
});




