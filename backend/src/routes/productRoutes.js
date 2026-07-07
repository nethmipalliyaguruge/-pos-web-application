import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every product route requires a logged-in user
router.use(protect);

router.get("/", getProducts);        // GET    /api/products
router.post("/", createProduct);     // POST   /api/products
router.get("/:id", getProduct);      // GET    /api/products/:id
router.put("/:id", updateProduct);   // PUT    /api/products/:id
router.delete("/:id", deleteProduct);// DELETE /api/products/:id

export default router;