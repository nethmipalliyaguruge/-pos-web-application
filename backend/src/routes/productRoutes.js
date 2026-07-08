import express from "express";
import { body } from "express-validator";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Every product route requires a logged-in user
router.use(protect);

// Validation rules for creating a product — all fields required.
const createRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("sku").trim().notEmpty().withMessage("SKU is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be 0 or more"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a whole number 0 or more"),
];

// For updates, every field is optional (you can edit just one), but if a
// field IS sent it must still be valid.
const updateRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("sku").optional().trim().notEmpty().withMessage("SKU cannot be empty"),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be 0 or more"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a whole number 0 or more"),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
];

// Reads are allowed for any logged-in user (cashiers need them for the POS).
router.get("/", getProducts);              // GET    /api/products
router.get("/categories", getCategories);  // GET    /api/products/categories
router.get("/:id", getProduct);            // GET    /api/products/:id

// Mutations are admin-only.
router.post("/", authorize("admin"), createRules, validate, createProduct);   // POST   /api/products
router.put("/:id", authorize("admin"), updateRules, validate, updateProduct); // PUT    /api/products/:id
router.delete("/:id", authorize("admin"), deleteProduct);                     // DELETE /api/products/:id

export default router;