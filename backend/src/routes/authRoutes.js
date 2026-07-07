import express from "express";
import { login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);        // POST /api/auth/login  (public)
router.get("/me", protect, getMe);   // GET  /api/auth/me     (protected)

export default router;