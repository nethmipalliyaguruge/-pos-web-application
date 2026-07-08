import express from "express";
import { getSummary } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard is a manager view — admin only.
router.get("/summary", protect, authorize("admin"), getSummary); // GET /api/dashboard/summary

export default router;