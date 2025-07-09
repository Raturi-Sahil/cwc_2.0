import { Router } from "express";
import { changeCurrentPassword, getcurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router(); // creating a router variable, which will have all functionlity of router. 


// here we are using multer as a middleware that runs before request reaches the controller for this /register endpoint and adds .fields to the req.
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1}, 
        {name: "coverImage", maxCount: 1}
    ]),   
    registerUser
)

router.route("/login").post(
    loginUser
);

// sercured routes: After registration and login, any endpoint the user hits, will first haveto go through the auth middleware, where the jwt token will be verified, before the req reaches the middleware. 
router.route("/logout").post(
    verifyJWT,
    logoutUser
);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").patch(changeCurrentPassword);

router.route("/current-user").get(getcurrentUser);

router.route("/update-account").patch(updateAccountDetails);

router.route("/avatar").patch(
    upload.single("avatar"), // since we only expect 1 file so we can just use this.
    verifyJWT,
    updateUserAvatar
);

router.route("/cover-image").patch(
    upload.single("coverImage"),
    verifyJWT,
    updateUserCoverImage
);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;

