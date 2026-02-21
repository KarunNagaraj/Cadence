import { Router } from "express";

import { getAllUsers, getMessages } from "../controller/user.controller.js";
const router = Router();

router.get("/", getAllUsers);


export default router;