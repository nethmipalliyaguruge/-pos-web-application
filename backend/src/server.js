import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();          // load variables from .env
connectDB();              // connect to MongoDB Atlas

const app = express();

app.use(cors());          // allow the React frontend to call this API
app.use(express.json());  // let the server read JSON request bodies

// A simple test route so we can confirm the server works
app.get("/", (req, res) => {
  res.json({ message: "POS API is running 🚀" });
});

//Feature routes
app.use("/api/auth", authRoutes);  // all auth routes start with /api/auth

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});