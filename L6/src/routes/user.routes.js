import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router(); // creating a router variable, which will have all functionlity of router. 


// here we are using multer as a middleware that runs before request reaches the controller for this /register endpoint and adds .fields to the req.
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1}, 
        {name: "coverImage", maxCount: 1}
    ]),   
    registerUser
)

export default router;

