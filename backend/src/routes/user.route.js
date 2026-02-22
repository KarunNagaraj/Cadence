import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages } from "../controller/user.controller.js";
const router = Router();
router.use(protectRoute, requireAdmin);

router.get("/", getAllUsers);


export default router;