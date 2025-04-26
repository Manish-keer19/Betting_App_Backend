import { Router } from "express";

import { authentication } from "../middleware/authantication.js";
import { generateOtp, Login, Signup } from "../controller/auth.controller.js";
const authRoute = Router();


authRoute.post("/signup",Signup);
authRoute.post("/generate-otp",generateOtp);
authRoute.post("/login",Login);


export default authRoute;
