import mongoose from "mongoose";

// A sale is made up of one or more line items.
// We SNAPSHOT the product name and price here so that
// editing/deleting a product later does NOT change past sales.
const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",           // link back to the product (reference only)
    },
    name: {
      type: String,
      required: true,           // snapshot of product name at sale time
    },
    price: {
      type: Number,
      required: true,           // snapshot of unit price at sale time
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,           // price * quantity
    },
  },
  { _id: false } // no separate id needed for each line item
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,             // e.g. INV-1001
    },
    items: {
      type: [saleItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,                   // final total can't be negative
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",              // which user made the sale
      required: true,
    },
  },
  { timestamps: true } // createdAt = the sale date/time
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;