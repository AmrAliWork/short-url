const request = require("supertest");
const assert = require("assert");
const app = require("../app");
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");

const createUser = async () => {
  const email = `amr${Date.now()}@gmail.com`;

  const user = await request(app).post("/users/signup").send({
    name: "amr",
    email,
    password: "12345678",
    passwordConfirm: "12345678",
  });

  return {
    token: user.body.token,
    email,
  };
};

it("GET /users/me should return me", async () => {
  const { token } = await createUser();

  const res = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
});

it("GET /users/me should reject unauthenticated request", async () => {
  const res = await request(app).get("/users/me");

  assert.strictEqual(res.status, 401);
});

it("GET /users/me should reject an invalid token", async () => {
  const res = await request(app)
    .get("/users/me")
    .set("Authorization", "Bearer invalid-token");

  assert.strictEqual(res.status, 401);
});

it("GET /users/me should reject an expired token", async () => {
  const token = jwt.sign({ id: "some-user-id" }, process.env.SECRET_KEY, {
    expiresIn: -1,
  });

  const res = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 401);
});

it("GET /users/me should reject token for deleted user", async () => {
  const { token, email } = await createUser();

  await User.deleteOne({ email });

  const res = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 404);
});

it("PATCH /users/me should update the user's name and email", async () => {
  const user = await createUser("update@example.com");

  const res = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      name: "Updated Name",
      email: "updated@example.com",
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.name, "Updated Name");
  assert.strictEqual(res.body.data.email, "updated@example.com");
});

it("PATCH /users/me should reject unauthorized fields", async () => {
  const user = await createUser("field@example.com");

  const res = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      name: "Updated Name",
      password: "newpassword",
    });

  assert.strictEqual(res.status, 400);
});

it("PATCH /users/me should reject unauthenticated request", async () => {
  const res = await request(app).patch("/users/me").send({
    name: "Updated Name",
  });

  assert.strictEqual(res.status, 401);
});
it("PATCH /users/me/update-password should update the password", async () => {
  const user = await createUser("password@example.com");

  const res = await request(app)
    .patch("/users/me/update-password")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      currentPassword: "12345678",
      password: "87654321",
      passwordConfirm: "87654321",
    });

  assert.strictEqual(res.status, 200);
});
it("PATCH /users/me/update-password should reject wrong current password", async () => {
  const user = await createUser("wrongpassword@example.com");

  const res = await request(app)
    .patch("/users/me/update-password")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      currentPassword: "wrongpassword",
      password: "87654321",
      passwordConfirm: "87654321",
    });

  assert.strictEqual(res.status, 400);
});
it("PATCH /users/me/update-password should reject mismatched passwords", async () => {
  const user = await createUser("mismatch@example.com");

  const res = await request(app)
    .patch("/users/me/update-password")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      currentPassword: "12345678",
      password: "87654321",
      passwordConfirm: "12345679",
    });

  assert.strictEqual(res.status, 400);
});
it("PATCH /users/me/update-password should reject non-string password data", async () => {
  const user = await createUser("invalid-password@example.com");

  const res = await request(app)
    .patch("/users/me/update-password")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      currentPassword: { $ne: null },
      password: "87654321",
      passwordConfirm: "87654321",
    });

  assert.strictEqual(res.status, 400);
});
it("PATCH /users/me/update-password should invalidate the old token", async () => {
  const user = await createUser("invalidate@example.com");

  const updateRes = await request(app)
    .patch("/users/me/update-password")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      currentPassword: "12345678",
      password: "87654321",
      passwordConfirm: "87654321",
    });

  assert.strictEqual(updateRes.status, 200);

  const res = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${user.token}`);

  assert.strictEqual(res.status, 401);
});
