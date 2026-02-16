import { Router } from "express";

const router = Router();

router.post('/',(req,res)=>{
    res.send("admin route with get method");
});
export default router;