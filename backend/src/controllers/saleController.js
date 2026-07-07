import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// Helper: generate the next invoice number like INV-00001
const generateInvoiceNumber = async () => {
  const count = await Sale.countDocuments();
  return `INV-${String(count + 1).padStart(5, "0")}`;
};

// @desc   Create a new sale
// @route  POST /api/sales
export const createSale = async (req, res) => {
  const { items, discount = 0 } = req.body;

  // RULE 1: cart cannot be empty
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cannot complete an empty sale" });
  }

  let subtotal = 0;
  const saleItems = [];
  const stockUpdates = [];

  // Validate EVERY item before changing anything
  for (const item of items) {
    const product = await Product.findById(item.product);

    // RULE: product must exist
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.product}` });
    }
    // RULE: inactive products can't be sold
    if (!product.isActive) {
      return res.status(400).json({ message: `Product is inactive: ${product.name}` });
    }

    const quantity = Number(item.quantity);
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
    }

    // RULE: not enough stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
      });
    }

    const lineTotal = product.price * quantity;
    subtotal += lineTotal;

    // SNAPSHOT name + price at the time of sale
    saleItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      lineTotal,
    });

    stockUpdates.push({ product, quantity });
  }

  // RULE: discount can't be negative or bigger than subtotal (no negative total)
  const discountValue = Number(discount) || 0;
  if (discountValue < 0) {
    return res.status(400).json({ message: "Discount cannot be negative" });
  }
  if (discountValue > subtotal) {
    return res.status(400).json({ message: "Discount cannot exceed subtotal" });
  }

  const total = subtotal - discountValue;

  // All checks passed — NOW reduce stock
  for (const { product, quantity } of stockUpdates) {
    product.stock -= quantity;
    await product.save();
  }

  // Create the sale record
  const sale = await Sale.create({
    invoiceNumber: await generateInvoiceNumber(),
    items: saleItems,
    subtotal,
    discount: discountValue,
    total,
    createdBy: req.user._id,
  });

  res.status(201).json(sale);
};

// @desc   Get all sales — date range filter + pagination
// @route  GET /api/sales
export const getSales = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by date range if provided
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999); // include the whole end day
      filter.createdAt.$lte = end;
    }
  }

  const total = await Sale.countDocuments(filter);
  const sales = await Sale.find(filter)
    .populate("createdBy", "name email") // include who made each sale
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ sales, page, totalPages: Math.ceil(total / limit), total });
};

// @desc   Get one sale's full details
// @route  GET /api/sales/:id
export const getSale = async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate("createdBy", "name email");
  if (!sale) {
    return res.status(404).json({ message: "Sale not found" });
  }
  res.json(sale);
};