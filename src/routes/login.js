import { Router } from "express";
import { signin, signup, sendOtp , changePassword } from "../controller/authCon.js";

const router = Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/sendOtp", sendOtp);
router.post("/changePassword", changePassword);


export default router;