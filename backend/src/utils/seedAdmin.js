import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

// Default users (also documented in the README).
// One manager (admin) and one cashier to demonstrate role-based access.
const USERS = [
  { name: "Admin", email: "admin@pos.com", password: "admin123", role: "admin" },
  { name: "Cashier", email: "cashier@pos.com", password: "cashier123", role: "cashier" },
];

const seedUsers = async () => {
  try {
    await connectDB();

    for (const user of USERS) {
      // Don't create a duplicate if this user already exists
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        console.log(`ℹ️  User already exists: ${user.email} (${user.role})`);
      } else {
        await User.create(user); // password gets hashed automatically by the model
        console.log(`✅ Created ${user.role}: ${user.email} / ${user.password}`);
      }
    }

    await mongoose.connection.close(); // close DB and exit
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedUsers();