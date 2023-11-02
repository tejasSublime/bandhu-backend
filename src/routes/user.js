import { Router } from "express";
import { getUserData } from "../controller/userCon.js";
import { verifyToken } from "../config/jwtConfig.js";
const router = Router();

router.get("/getUserData", verifyToken, getUserData);


export default router;