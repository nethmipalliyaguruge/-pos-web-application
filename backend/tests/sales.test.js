import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import Product from "../src/models/Product.js";
import { createUser, tokenFor, createProduct } from "./helpers.js";

describe("POST /api/sales", () => {
  let token;

  // Every test here needs a logged-in user, so make one before each test.
  beforeEach(async () => {
    const user = await createUser();
    token = tokenFor(user);
  });

  // Small helper: POST a sale with our auth token.
  const postSale = (body) =>
    request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

  it("rejects an empty cart", async () => {
    const res = await postSale({ items: [] });
    expect(res.status).toBe(400);
  });

  it("creates a sale and decrements stock", async () => {
    const product = await createProduct({ price: 50, stock: 10 });

    const res = await postSale({
      items: [{ product: product._id, quantity: 3 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.subtotal).toBe(150); // 50 * 3
    expect(res.body.total).toBe(150);
    expect(res.body.invoiceNumber).toMatch(/^INV-\d{5}$/);

    // The product's stock should have dropped from 10 to 7.
    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(7);
  });

  it("blocks overselling (quantity greater than stock)", async () => {
    const product = await createProduct({ stock: 5 });

    const res = await postSale({
      items: [{ product: product._id, quantity: 10 }],
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not enough stock/i);

    // Stock must be untouched after a rejected sale.
    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(5);
  });

  it("merges duplicate lines so the same product can't oversell", async () => {
    const product = await createProduct({ stock: 10 });

    // 6 + 6 = 12, which is more than the 10 in stock.
    const res = await postSale({
      items: [
        { product: product._id, quantity: 6 },
        { product: product._id, quantity: 6 },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not enough stock/i);
  });

  it("rejects a discount larger than the subtotal", async () => {
    const product = await createProduct({ price: 50, stock: 10 });

    const res = await postSale({
      items: [{ product: product._id, quantity: 1 }], // subtotal = 50
      discount: 100,                                   // more than subtotal
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/discount cannot exceed/i);
  });

  it("cannot sell an inactive product", async () => {
    const product = await createProduct({ isActive: false });

    const res = await postSale({
      items: [{ product: product._id, quantity: 1 }],
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/inactive/i);
  });
});