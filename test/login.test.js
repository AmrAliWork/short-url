const request = require("supertest");
const assert = require("assert");
const app = require("../app");
const User = require("../Models/userModel");

const createUser = async (email) => {
  await User.create({
    name: "amr",
    email,
    password: "12345678",
    passwordConfirm: "12345678",
  });
};

it("POST /users/login should return a token", async () => {
  await createUser("amr@gmail.com");

  const res = await request(app).post("/users/login").send({
    email: "amr@gmail.com",
    password: "12345678",
  });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token);
});

it("POST /users/login should reject wrong password", async () => {
  await createUser("amr@gmail.com");

  const res = await request(app).post("/users/login").send({
    email: "amr@gmail.com",
    password: "123456789",
  });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should reject wrong email", async () => {
  await createUser("amr@gmail.com");

  const res = await request(app).post("/users/login").send({
    email: "amr1@gmail.com",
    password: "12345678",
  });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should reject missing email", async () => {
  await createUser("amr@gmail.com");

  const res = await request(app).post("/users/login").send({
    password: "12345678",
  });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should reject missing password", async () => {
  await createUser("amr@gmail.com");

  const res = await request(app).post("/users/login").send({
    email: "amr@gmail.com",
  });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should reject non-string email", async () => {
  await createUser("victim@example.com");

  const res = await request(app)
    .post("/users/login")
    .send({
      email: { $ne: null },
      password: "12345678",
    });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should reject non-string password", async () => {
  await createUser("victim@example.com");

  const res = await request(app)
    .post("/users/login")
    .send({
      email: "victim@example.com",
      password: { $ne: null },
    });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should reject non-string credentials", async () => {
  await createUser("victim@example.com");

  const res = await request(app)
    .post("/users/login")
    .send({
      email: { $ne: null },
      password: { $ne: null },
    });

  assert.strictEqual(res.status, 401);
});

it("POST /users/login should rate limit excessive requests", async () => {
  let lastResponse;

  for (let i = 0; i < 11; i++) {
    lastResponse = await request(app)
      .post("/users/login")
      .set("X-Forwarded-For", "10.0.0.1")
      .send({
        email: "attacker@example.com",
        password: "wrongpassword",
      });
  }

  assert.strictEqual(lastResponse.status, 429);
});
