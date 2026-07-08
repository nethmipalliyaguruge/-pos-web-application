import express from "express";
import { body } from "express-validator";
import { createSale, getSales, getSale } from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect); // all sale routes require login

// A sale needs at least one item, each with a product id and a quantity >= 1.
// Discount is optional but, if sent, cannot be negative. (The controller
// still enforces the deeper business rules: stock, inactive, discount <= subtotal.)
const saleRules = [
  body("items").isArray({ min: 1 }).withMessage("A sale must have at least one item"),
  body("items.*.product").notEmpty().withMessage("Each item must have a product"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Each quantity must be at least 1"),
  body("discount").optional().isFloat({ min: 0 }).withMessage("Discount cannot be negative"),
];

router.post("/", saleRules, validate, createSale); // POST /api/sales
router.get("/", getSales);                          // GET  /api/sales
router.get("/:id", getSale);                        // GET  /api/sales/:id

export default router;