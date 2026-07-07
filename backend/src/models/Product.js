import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,      // each product has a unique code
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,            // price can't be negative
    },
    stock: {
      type: Number,
      required: true,
      min: 0,            // stock can't be negative
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,     // active = available for sale
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;