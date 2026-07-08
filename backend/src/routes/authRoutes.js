import express from "express";
import { body } from "express-validator";
import { login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Require a well-formed email and a non-empty password before hitting the controller.
const loginRules = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/login", loginRules, validate, login); // POST /api/auth/login  (public)
router.get("/me", protect, getMe);                   // GET  /api/auth/me     (protected)

export default router;