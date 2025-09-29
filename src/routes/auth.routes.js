import { logout, signIn, signUp } from "#controllers/auth.contoller.js";
import express from "express";

const router = express.Router();

router.post("/sign-up", signUp);

router.post("/login", signIn);

router.post("/logout", logout);

export default router;
