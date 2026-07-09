import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import generateToken from "../src/utils/generateToken.js";

// Create a user in the (in-memory) DB. Defaults to an admin; pass overrides
// to change any field, e.g. createUser({ role: "cashier" }).
export const createUser = async (overrides = {}) => {
  return User.create({
    name: "Test Admin",
    email: "admin@test.com",
    password: "secret123",
    role: "admin",
    ...overrides,
  });
};

// Sign a real JWT for a given user — the same token the login route would give.
export const tokenFor = (user) => generateToken(user._id);

// Create a product. Each one gets a unique SKU so the `unique` rule never clashes.
let skuCounter = 0;
export const createProduct = async (overrides = {}) => {
  skuCounter += 1;
  return Product.create({
    name: "Test Product",
    sku: `SKU-${skuCounter}`,
    category: "General",
    price: 100,
    stock: 10,
    ...overrides,
  });
};