import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    
try {
        //first extract the jwt/access token from the req.
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        //if the accessToken doesn't exist then return 
        if(!accessToken)
        throw new ApiError(401, "Unauthorized request");
    
        //if the accestoken is there then first decode it.
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
        // //if the jwt verification fails then unauthorized request
        // if(!decoded) 
        // throw new ApiError(401, "Unauthorized request");
        // No need to verify decoded, cuz if the verification fails it won't return anything it will directly throw an error which our asyncHandler will handle. 
    
        const user = User.findById(decoded._id).select("-password -refreshToken");
    
        if(!user)
        throw new ApiError(401, "Invlaid access token");
    
        req.user = user;
        next();
} catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
}

});     