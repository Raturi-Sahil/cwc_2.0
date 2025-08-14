import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async (req, res) => {
    // check for the req fields and see if provide in body.
    // Then see if any of them is invalid.
    // Check based on logic whether same video can be uploaded again or not, with given title, description, owner. May be different owner can have same video but not the same person.
    //if it's ohk, then just upload avatar and video on cloudinary and store their url in database. 
    // and that is all i guess. 
    // Verification of this endpoint will happend in routes folder using jwtVerify. 

    // Write some backend everyday. Little bit of it. 
});