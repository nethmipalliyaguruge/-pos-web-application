import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { createUser, tokenFor } from "./helpers.js";

describe("POST /api/auth/login", () => {
  it("returns 400 when the password is missing", async () => {
    await createUser({ email: "a@test.com", password: "secret123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@test.com" }); // no password

    expect(res.status).toBe(400);
  });

  it("returns 401 for a wrong password", async () => {
    await createUser({ email: "a@test.com", password: "secret123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@test.com", password: "wrongpass" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("returns a token and user for correct credentials", async () => {
    await createUser({ email: "a@test.com", password: "secret123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@test.com", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("a@test.com");
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the logged-in user when a valid token is sent", async () => {
    const user = await createUser({ email: "a@test.com" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("a@test.com");
  });
});