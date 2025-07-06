import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


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
   if([username, email, fullName, password].some(field => {
    field?.trim() === ""
   })) {
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
    if(!username || !email) {
        throw new ApiError(400, "Username or email is required");
    }

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
    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // options to secure our cookies.
    const options = {
        httponly: true,
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

export { loginUser, registerUser }