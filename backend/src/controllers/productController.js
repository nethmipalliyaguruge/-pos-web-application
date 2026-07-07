import Product from "../models/Product.js";

// @desc   Get products — supports search + pagination + status filter
// @route  GET /api/products
export const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;   // which page (default 1)
  const limit = parseInt(req.query.limit) || 10; // items per page (default 10)
  const skip = (page - 1) * limit;

  const filter = {};

  // Search by name OR sku (case-insensitive)
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { sku: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Optional filter by active/inactive
  if (req.query.status === "active") filter.isActive = true;
  if (req.query.status === "inactive") filter.isActive = false;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 }) // newest first
    .skip(skip)
    .limit(limit);

  res.json({
    products,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
};

// @desc   Get one product by id
// @route  GET /api/products/:id
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

// @desc   Create a new product
// @route  POST /api/products
export const createProduct = async (req, res) => {
  const { name, sku, category, price, stock, isActive } = req.body;
  const product = await Product.create({ name, sku, category, price, stock, isActive });
  res.status(201).json(product);
};

// @desc   Update a product
// @route  PUT /api/products/:id
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, sku, category, price, stock, isActive } = req.body;
  // Only update fields that were actually sent
  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (isActive !== undefined) product.isActive = isActive;

  const updated = await product.save();
  res.json(updated);
};

// @desc   Delete a product
// @route  DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  await product.deleteOne();
  res.json({ message: "Product deleted" });
};