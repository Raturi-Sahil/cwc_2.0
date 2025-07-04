import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) => {
    // destructure inputs
   const { username, email, fullName, password } = req.body;
   

   //But here my question is if below when creating a user we are converting the username into lowercase then how are we comparing here without converting the username to lowercase again. ?
   // To check if any of the input fields is empty.
   if([username, email, fullName, password].some(field => {
    field?.trim() === ""
   })) {
        throw new ApiError(400, "All inputs fields are required");
   }

   //To check if the username and email already exists. 
   const existingUser = User.findOne( {
        $or: [{username}, {email}]

        // rather than doing res.status().json({}) we are just using the helper class we have created, where we use it's object and just show the erorr to the user.
    })

    if(existingUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(409, "Avatar file coudn't be uploaded, Internal server error");
    }

    const user = await User.create({
        fullName, 
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "Internal server error, something went wrong while registering the user");
    }
    
    // This 201 is for postman, cuz postman expects status from .status.
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export { registerUser }