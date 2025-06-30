import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "./constants";
import connectDB from "./db";
import { app } from "./app";

const PORT = process.env.PORT || 5000;

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