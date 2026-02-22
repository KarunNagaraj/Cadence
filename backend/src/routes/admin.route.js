import { Router } from "express";
import { checkAdmin} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);



export default router;