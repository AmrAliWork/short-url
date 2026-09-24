const request = require("supertest");
const assert = require("assert");
const app = require("../app");
const User = require("../Models/userModel");

it("POST /users/signup should create a new user", async () => {
  const response = await request(app).post("/users/signup").send({
    name: "Test User",
    email: "test@example.com",
    password: "12345678",
    passwordConfirm: "12345678",
  });

  assert.strictEqual(response.status, 201);

  const user = await User.findOne({ email: "test@example.com" });

  assert.ok(user);
  assert.strictEqual(user.name, "Test User");
  assert.strictEqual(user.email, "test@example.com");
});

it("POST /users/signup should reject missing name", async () => {
  const res = await request(app).post("/users/signup").send({
    email: "test@example.com",
    password: "12345678",
    passwordConfirm: "12345678",
  });

  assert.strictEqual(res.status, 400);

  const user = await User.findOne({ email: "test@example.com" });

  assert.strictEqual(user, null);
});

it("POST /users/signup should reject missing email", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    password: "12345678",
    passwordConfirm: "12345678",
  });

  assert.strictEqual(res.status, 400);

  const user = await User.findOne({ name: "amr" });

  assert.strictEqual(user, null);
});

it("POST /users/signup should reject missing password", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    email: "amr@example.com",
    passwordConfirm: "12345678",
  });

  assert.strictEqual(res.status, 400);

  const user = await User.findOne({ email: "amr@example.com" });

  assert.strictEqual(user, null);
});

it("POST /users/signup should reject short password", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    email: "amr@example.com",
    password: "1234567",
    passwordConfirm: "1234567",
  });

  assert.strictEqual(res.status, 400);

  const user = await User.findOne({ email: "amr@example.com" });

  assert.strictEqual(user, null);
});

it("POST /users/signup should reject long password", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    email: "amr@example.com",
    password: "01234567890123456789",
    passwordConfirm: "01234567890123456789",
  });

  assert.strictEqual(res.status, 400);

  const user = await User.findOne({ email: "amr@example.com" });

  assert.strictEqual(user, null);
});

it("POST /users/signup should reject mismatched passwords", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    email: "amr@example.com",
    password: "01234567890123456789",
    passwordConfirm: "0123456789012345",
  });

  assert.strictEqual(res.status, 400);

  const user = await User.findOne({ email: "amr@example.com" });

  assert.strictEqual(user, null);
});

it("POST /users/signup should not return the password", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    email: "amr@example.com",
    password: "12345678",
    passwordConfirm: "12345678",
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.password, undefined);
});

it("POST /users/signup should hash the password", async () => {
  const res = await request(app).post("/users/signup").send({
    name: "amr",
    email: "amr@example.com",
    password: "12345678",
    passwordConfirm: "12345678",
  });

  assert.strictEqual(res.status, 201);

  const user = await User.findOne({ email: "amr@example.com" }).select(
    "+password",
  );

  assert.notStrictEqual(user.password, "12345678");
});
