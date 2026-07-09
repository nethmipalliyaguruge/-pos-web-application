import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

// Default users (also documented in the README).
// One manager (admin) and one cashier to demonstrate role-based access.
const USERS = [
  { name: "Admin", email: "admin@pos.com", password: "admin123", role: "admin" },
  { name: "Cashier", email: "cashier@pos.com", password: "cashier123", role: "cashier" },
];

// Sample products so the app is immediately explorable after seeding:
// several categories (for the POS tiles), a couple of low-stock items (so the
// dashboard "Low Stock" list has something to show), and one inactive product
// (to demonstrate the Status column — inactive items can't be sold).
const PRODUCTS = [
  // Beverages
  { name: "Coca-Cola 500ml", sku: "BEV-001", category: "Beverages", price: 120, stock: 40 },
  { name: "Nescafé Classic 100g", sku: "BEV-002", category: "Beverages", price: 950, stock: 15 },
  { name: "Bottled Water 1L", sku: "BEV-003", category: "Beverages", price: 80, stock: 3 }, // low stock
  // Snacks & Confectionery
  { name: "Potato Chips 100g", sku: "SNK-001", category: "Snacks & Confectionery", price: 250, stock: 25 },
  { name: "Chocolate Bar", sku: "SNK-002", category: "Snacks & Confectionery", price: 180, stock: 4 }, // low stock
  // Bakery
  { name: "White Bread Loaf", sku: "BKY-001", category: "Bakery", price: 140, stock: 20 },
  { name: "Butter Croissant", sku: "BKY-002", category: "Bakery", price: 160, stock: 12 },
  // Dairy
  { name: "Fresh Milk 1L", sku: "DRY-001", category: "Dairy", price: 320, stock: 18 },
  { name: "Cheddar Cheese 200g", sku: "DRY-002", category: "Dairy", price: 780, stock: 10 },
  // Stationery
  { name: "Blue Ballpoint Pen", sku: "STN-001", category: "Stationery", price: 40, stock: 100 },
  { name: "A4 Notebook", sku: "STN-002", category: "Stationery", price: 220, stock: 8, isActive: false },
  //Health & Beauty
  { name: "Shampoo 250ml", sku: "HLT-001", category: "Health & Beauty", price: 450, stock: 30 },
  { name: "Toothpaste 100g", sku: "HLT-002", category: "Health & Beauty", price: 150, stock: 50 },// inactive demo
];

const seedData = async () => {
  try {
    await connectDB();

    // --- Users ---
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

    // --- Products ---
    for (const product of PRODUCTS) {
      // Skip if a product with this SKU already exists (SKU is unique)
      const existing = await Product.findOne({ sku: product.sku });
      if (existing) {
        console.log(`ℹ️  Product already exists: ${product.sku} (${product.name})`);
      } else {
        await Product.create(product);
        console.log(`✅ Created product: ${product.sku} — ${product.name}`);
      }
    }

    await mongoose.connection.close(); // close DB and exit
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();
