import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router(); // creating a router variable, which will have all functionlity of router. 

router.route("/register").post(registerUser)

export default router;

