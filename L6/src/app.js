import express from "express";
import cors from "cors";

import { errorHandler } from "./middlewares/error.middleware.js"


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json());

// Global error handler.
app.use(errorHandler);

// import routes 
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

// declare route
app.use("/api/v1/users", userRouter);
app.use("api/v1/video", videoRouter);



// at production grade the routes look something like this: http://localhost:8000//api/v1/users/.....


export {app}



/*
import express from "express"

export const app = express();
*/