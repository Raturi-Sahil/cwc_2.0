import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB Host ${connectionInstance.connection.host}`); 
        // connectionInstance.connection.host, this gives us the db url, helps us know where our database is connected, cuz db for production, developement, testing are different.
    }catch {
        console.log("MongoDB connection Error: ", error);
        process.exit(1);
    }
}

export default connectDB;