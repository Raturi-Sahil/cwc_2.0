import { Router } from "express";
import { changeCurrentPassword, getcurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
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

router.route("/changepassword").post(changeCurrentPassword);

router.route("/getuser").post(getcurrentUser);

router.route("/updateaccountdetails").post(updateAccountDetails);

router.route("/uploadavatar").post(
    upload.single("avatar"), // since we only expect 1 file so we can just use this.
    verifyJWT,
    updateUserAvatar
);

export default router;

