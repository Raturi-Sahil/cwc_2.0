import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Some error occured while generating aceess and refresh token");
    }
}

const registerUser = asyncHandler(async(req, res) => {

    console.log(req.body); // multer populates the req.body with all the text data in the input. 
    console.log(req.files);// multer populates the req.files with the files data. 

    // destructure inputs
   const { username, email, fullName, password } = req.body;
   

   //But here my question is if below when creating a user we are converting the username into lowercase then how are we comparing here without converting the username to lowercase again. ?
   // To check if any of the input fields is empty.
   if([username, email, fullName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All inputs fields are required");
   }

   //To check if the username and email already exists. 
   const existingUser = await User.findOne( {
        $or: [{username}, {email}]

        // rather than doing res.status().json({}) we are just using the helper class we have created, where we use it's object and just show the erorr to the user.
    })

    if(existingUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    console.log(req.files?.avatar[0]);
    console.log(req.files?.coverImage?.[0]);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;//it even works for the case when we don't provide the coverImage key-value pair in req.

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    console.log(avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar);

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

const loginUser = asyncHandler(async(req, res) => {
    // destructuring the input.
    const { email, username, password } = req.body;

    // // Check if any input field is invalid. 
    // if([email, username, password].some(find => {
    //     find?.trim() == "" // will evaluate to either true or false. 
    // })) {
    //     throw new ApiError(400, "All fields are required.");
    // }

    // see here we are just trying to see how to handle both email or username at once. If you want you can predefine what would be used for login. 
    // if(!username || !email) {
    //     throw new ApiError(400, "Username or email is required");
    // } It's incorrect

    if(!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    // Alternate way if(!(username || email)) {}
    

    // so this is how we check for both
    const existingUser = await User.findOne({$or : [{username}, {email}]});// i forgot to put await here. 
    /* const correctPassword = await existingUser.isPasswordCorrect(password); // the methods that we create inside the schema are accessed using instance of that model.  

    // if(!existingUser ||  !correctPassword) {
    //     throw new ApiError(400, "Invalid credentials");
    } */
   // The above logic might lead to runtime error given that if user doesn't exist means user = null and inside the isPasswordCorrect we do this.password, which is equal to doing null.password and will cause crash. Therefore gotta check them seperately.

    if(!existingUser) {
        throw new ApiError(400, "Invalid credentials");
    }

    const isPasswordValid = existingUser.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials"); 
    }

    // // update the accessToken and refreshToken field. 
    // existingUser.accessToken = existingUser.generateAccessToken;
    // existingUser.refreshToken = existingUser.generateRefreshToken;
    // const response = await existingUser.save();
    // here make sure u await on this function. Understanding the async nature of js is really important, if there is a possiblity that an operation might take some time then simply await on it. 


    // creating access and refresh token in a smart way. 
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(existingUser._id);

    // modifying the existingUser, so that we can send it back in response. 
    const LoggedInUser = await User.findById(existingUser._id).select("-password -refreshToken");

    // options to secure our cookies.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: LoggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully"
        ) // no semicolon here

        /**
         *          ✅ The expression itself should not be terminated early by a semicolon.

                    👉 The semicolon goes after the full return or statement, like:

                    const x = new ApiResponse(...);  // good
                    return res.json(new ApiResponse(...));  // good
                    but not inside function arguments:
                    json(new ApiResponse(...); );  // ❌ syntax error
         */
    );

});

const logoutUser =  asyncHandler(async(req, res) => {
    
    // first get the userId
    // const user = req.user;

    // //Remove the refresh token
    // user.accessToken = "";    

    await User.findByIdAndDelete(
        req.user._id,
         {
            $set: {
                refreshToken: undefined // setting refreshToken to undefined. 
            }
        },
        {
            new: true // will return the updated user, if we try to store the repose that is. 
        }
    )


    // options to secure our cookies.
    const options = {
        httpOnly: true,
        secure: true
    }

    //response to user
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
         new ApiResponse(201, {}, "User successfully logged out")
    );

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unautorized request");
    }

    // this try catch ain't necessary but still using it for safety purpose. 
  try {
      const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
      const user = await User.findById(decoded?._id);
      
      if(!user) {
          throw new ApiError(401, "Unautorized request");
      }
  
      if( incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is exprired or used");
      }
  
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id); // gotta await on it
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
          new ApiResponse(
              201,
              { accessToken, refreshToken }, 
              "AccessToken refreshed")
      );
  } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
  }

});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    
    //first extract the old and new passwords
    const { oldPassword, newPassword } = req.body;

    /**
     * if user were to provide the confirm password as well then just destructure the confirmPassword above 
     * and then if new and confirm passwords are not same return an ApiError early
     */

    //Get the user id
    const user = await User.findById(req.user?._id);

    //Check if the old passowrd is matching
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    // if the password match fails then throw an error
    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );

});

const getcurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    // .json(200, req.user, "current user fetched successfully"); this is incorrect cuz json only accepts one argument
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email } = req.body;

    if(!username || !email){
        throw new ApiError(401, "All input fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {$set: {username, email}},
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user,
            "User details updated successfully"
        )
    );

});

// Just for fun.
// const updateUserInfo = asyncHandler(async (req, res) => {
//         const updates = Object.keys(req.body);

//         if(!updates) {
//             throw new ApiError(401, "Invalid request");
//         }

//         const allowedUpdates = ["username", "email", "fullName"];

//         const isValid = updates.every(key => allowedUpdates.includes(key));

//         if(!isValid) {
//             new ApiResponse(401, "Invlid update request");
//         }

//         // extract the user
//         const user = await User.findById(req.user?._id);
//         // update the user info
//         updates.forEach(field => {
//             user[field] = req.body[field]
//         });

//         const updatedUserInfo = await User.findById(req.user?._id).select("-password -refreshToken");


//         return res
//         .status(200)
//         .json(
//             new ApiResponse(200, updatedUserInfo, "User info updated successfully")
//         );
// });


// only updates user Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {

    // Here don't just blindly take .files, take file cuz earlier is register route we needed to upload both avatar and cover.
    const avatarLocalPath = req.file?.avatar[0]?.path;
    // we can even save this file directly in the database, but as per industry standard we don't do it this way, rather we use 3rd party services for this.

    if(!avatarLocalPath) {
        throw new ApiError(401, "Avatar file is missing");
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url) {
        throw new ApiError(500, "Internal server error, Error while uploading on cloudinary"); // Here by writing a very specifc error message i can debug it easily later on.
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {avatar: avatar.url}
        },
        {new : true}
    ).select("-password -refreshToken");


    // here we can create and use a utility funciton that delete the previously uploaded image on cloudinary. for this we gotta hold the cloud url of the old image in some variable.

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user,
            "Avatar updated successfully"
        )
    );

});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    // Here don't just blindly take .files, take file cuz earlier is register route we needed to upload both avatar and cover.
    const coverImageLocalPath = req.file?.coverImage[0]?.path;
    // we can even save this file directly in the database, but as per industry standard we don't do it this way, rather we use 3rd party services for this.

    if(!coverImageLocalPath) {
        throw new ApiError(401, "CoverImage file is missing");
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new ApiError(500, "Internal server error, Error while uploading on cloudinary"); // Here by writing a very specifc error message i can debug it easily later on.
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {coverImage: coverImage.url}
        },
        {new : true}
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            user,
            "CoverImage updated successfully"
        )
    );

});

const getUserChannelProfile = asyncHandler(async (req, res) => {

    //fetch the username of the channel from the url 
    const { username } = req.params;

    if(!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: { // At stage 1, using match we first get the document of the user with usernmae which we fetched earlier.
                username: username?.toLowerCase()
            }
        },
        {   /* At stage 2, we fetch all the docs from the subscriptions model where the channel field is this user's id.
             so we made the query to lookup from (in) the subscriptions model ( local filed shows the field is called in User's model, whereas foreignFeild is what the field is called in the subscriptions model, the result we get would be called as subscribers. With all this we can get all the docs of subscription model where the subscriber is subscribed to the channel with this particular used id. I mean to get the subscribers.
            */
            $lookup: { 
                from: "subscriptions",
                localField: "_id",
                foreignField: "channels",
                as: "subscribers"
            }
        },
        { /* same logic as above lookup, but this time we are trying to get how many channels this current userid has subscribed to, so that we can send it in response to be rendered on the FE. */
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
          $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
          }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ]);

    console.log(channel);

    if(!channel?.length) {
        throw new ApiError(400, "Channel doesn't exist")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel,
            "User channel fetched successfully"
        )
    )
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,
             user[0].watchHistory, 
            "Watch history fetched successfully"
        )
    )
});

export { getWatchHistory, getUserChannelProfile, updateUserCoverImage, updateUserAvatar, updateAccountDetails, getcurrentUser, changeCurrentPassword, refreshAccessToken, logoutUser, loginUser, registerUser } 