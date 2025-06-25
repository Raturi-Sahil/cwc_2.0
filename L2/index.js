const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    console.log("sup buddy");
    res.status(200).json({msg: "Home page."})
});

app.get('/twitter', (req, res)=> {
    console.log("Inside the endpoint twitter");
    res.status(200).json({msg: "U have come to twitter's home page"});
});

app.get('/login', (req, res) => {
    console.log("Inside the login endpoint");
    res.send("<h1> This is where you login </h1>");
});

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});