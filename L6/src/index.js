import dotenv from "dotenv"
// dotenv.config({ 
//     path: './.env' // When we do npm run dev dotenv.config looks for file from the root. 
// });
dotenv.config(); // gotta put dotenv setup at the top to avoid reference error. 

//So either you write the above import and config or make changes in the script, "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js" 

// no ues of these two lines in this file.
// import mongoose from "mongoose";  
// import { DB_NAME } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 5000;

// console.log("MongoDb url ",process.env.MONGODB_URI); for debugging. 

connectDB()
.then(()=> {app.listen(PORT, ()=> {
    console.log("Server is running at the port", PORT);
})})
.catch((error) => {
    console.error("Mongo db connection failed!!!", error);
});



/*
import express from "express";
const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error", (error) => {
            console.log("error: ", error);
            throw error;
        });

        app.listen(PORT, ()=> {
            console.log(`App is listening on PORT ${process.env.PORT}`);
        })
    } catch(error) {
        console.log("error:", error);
        throw error;
    }
})();
*/