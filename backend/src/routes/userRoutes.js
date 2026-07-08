import express from "express";
import { body } from "express-validator";
import { getUsers, createUser, deleteUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Every user-management route is admin-only.
router.use(protect, authorize("admin"));

const createRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["admin", "cashier"]).withMessage("Role must be admin or cashier"),
];

router.get("/", getUsers);                          // GET    /api/users
router.post("/", createRules, validate, createUser);// POST   /api/users
router.delete("/:id", deleteUser);                  // DELETE /api/users/:id

export default router;
