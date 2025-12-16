import { register } from "../controllers/auth.controller";
import { login } from "../controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;