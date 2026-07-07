import express from "express";
import { createSale, getSales, getSale } from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // all sale routes require login

router.post("/", createSale);   // POST /api/sales
router.get("/", getSales);      // GET  /api/sales
router.get("/:id", getSale);    // GET  /api/sales/:id

export default router;