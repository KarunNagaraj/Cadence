import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
const router = Router();
router.use(protectRoute, requireAdmin);

router.get('/',(req,res)=>{
    res.send("stats route");
});
export default router;