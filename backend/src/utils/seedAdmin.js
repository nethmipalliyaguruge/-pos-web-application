import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

// Default admin credentials (also put these in your README later)
const ADMIN = {
  name: "Admin",
  email: "admin@pos.com",
  password: "admin123",
  role: "admin",
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Don't create a duplicate if the admin already exists
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log("ℹ️  Admin user already exists:", ADMIN.email);
    } else {
      await User.create(ADMIN); // password gets hashed automatically by the model
      console.log("✅ Admin user created!");
      console.log("   Email:", ADMIN.email);
      console.log("   Password:", ADMIN.password);
    }

    await mongoose.connection.close(); // close DB and exit
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();