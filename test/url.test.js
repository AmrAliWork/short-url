const request = require("supertest");
const assert = require("assert");
const app = require("../app");
const URLModel = require("../Models/urlModel");

const createUser = async (email) => {
  const res = await request(app).post("/users/signup").send({
    name: "Test User",
    email,
    password: "12345678",
    passwordConfirm: "12345678",
  });

  return res.body;
};

const createUrl = async (token) => {
  const res = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "https://google.com",
    });

  return res.body.data;
};

it("POST /urls should create a URL", async () => {
  const token = (await createUser("url1@example.com")).token;

  const res = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "https://google.com",
    });

  assert.strictEqual(res.status, 201);
  assert.ok(res.body.data.shortURL);
  assert.strictEqual(res.body.data.mainURL, "https://google.com");
});

it("POST /urls should reject invalid URL", async () => {
  const token = (await createUser("url2@example.com")).token;

  const res = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "google.com",
    });

  assert.strictEqual(res.status, 400);
});

it("POST /urls should reject missing URL", async () => {
  const token = (await createUser("url3@example.com")).token;

  const res = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.strictEqual(res.status, 400);
});

it("POST /urls should generate different short codes for the same URL", async () => {
  const token = (await createUser("url4@example.com")).token;

  const res1 = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "https://google.com",
    });

  const res2 = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "https://google.com",
    });

  assert.strictEqual(res1.status, 201);
  assert.strictEqual(res2.status, 201);
  assert.notStrictEqual(res1.body.data.shortURL, res2.body.data.shortURL);
});

it("POST /urls should reject unauthenticated request", async () => {
  const res = await request(app).post("/urls").send({
    mainURL: "https://google.com",
  });

  assert.strictEqual(res.status, 401);
});

it("GET /urls should return user's URLs", async () => {
  const token = (await createUser("get1@example.com")).token;

  await createUrl(token);
  await createUrl(token);

  const res = await request(app)
    .get("/urls")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 2);
});

it("GET /urls should return only user's own URLs", async () => {
  const tokenA = (await createUser("get2a@example.com")).token;
  const tokenB = (await createUser("get2b@example.com")).token;

  await createUrl(tokenA);
  await createUrl(tokenB);

  const res = await request(app)
    .get("/urls")
    .set("Authorization", `Bearer ${tokenA}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 1);
});

it("GET /urls should return empty array when user has no URLs", async () => {
  const token = (await createUser("get3@example.com")).token;

  const res = await request(app)
    .get("/urls")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body.data, []);
});

it("GET /urls should reject unauthenticated request", async () => {
  const res = await request(app).get("/urls");

  assert.strictEqual(res.status, 401);
});

it("GET /urls/:shortcode should return URL for owner", async () => {
  const token = (await createUser("getOne1@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  const res = await request(app)
    .get(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
});

it("GET /urls/:shortcode should return 404 for nonexistent URL", async () => {
  const token = (await createUser("getOne2@example.com")).token;

  const res = await request(app)
    .get("/urls/doesNotExist")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 404);
});

it("PATCH /urls/:shortcode should update URL for owner", async () => {
  const token = (await createUser("patch1@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  const res = await request(app)
    .patch(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "https://example.com",
    });

  assert.strictEqual(res.status, 200);
});

it("PATCH /urls/:shortcode should reject invalid URL", async () => {
  const token = (await createUser("patch2@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  const res = await request(app)
    .patch(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      mainURL: "google.com",
    });

  assert.strictEqual(res.status, 400);
});

it("DELETE /urls/:shortcode should delete URL for owner", async () => {
  const token = (await createUser("delete@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  const deleteRes = await request(app)
    .delete(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(deleteRes.status, 200);

  const getRes = await request(app)
    .get(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(getRes.status, 404);
});

it("GET /open/:shortcode should redirect to the original URL", async () => {
  const token = (await createUser("redirect@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  const res = await request(app).get(`/open/${shortCode}`).redirects(0);

  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, "https://google.com");
});

it("GET /open/:shortcode should increment click count", async () => {
  const token = (await createUser("clicks@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  await request(app).get(`/open/${shortCode}`).redirects(0);
  await request(app).get(`/open/${shortCode}`).redirects(0);

  const res = await request(app)
    .get(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.clickCount, 2);
});

it("GET /urls/:shortcode/statistics should return click count", async () => {
  const token = (await createUser("stats@example.com")).token;
  const url = await createUrl(token);
  const shortCode = url.shortURL.split("/").pop();

  await request(app).get(`/open/${shortCode}`).redirects(0);
  await request(app).get(`/open/${shortCode}`).redirects(0);
  await request(app).get(`/open/${shortCode}`).redirects(0);

  const res = await request(app)
    .get(`/urls/${shortCode}/statistics`)
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.clickCount, 3);
});

it("GET /urls should return the correct page", async () => {
  const user = await createUser("pagination@example.com");

  const urls = [];

  for (let i = 1; i <= 5; i++) {
    urls.push({
      user: user.data._id,
      mainURL: `https://example${i}.com`,
      shortCode: `code${i}`,
    });
  }

  await URLModel.insertMany(urls);

  const res = await request(app)
    .get("/urls?page=2&limit=2")
    .set("Authorization", `Bearer ${user.token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 2);
  assert.strictEqual(res.body.data.length, 2);
});

it("GET /urls should reject page = 0", async () => {
  const token = (await createUser("page0@example.com")).token;

  const res = await request(app)
    .get("/urls?page=0")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 400);
});

it("GET /urls should reject non-numeric page", async () => {
  const token = (await createUser("pageabc@example.com")).token;

  const res = await request(app)
    .get("/urls?page=abc")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 400);
});

it("GET /urls should reject limit = 0", async () => {
  const token = (await createUser("limit0@example.com")).token;

  const res = await request(app)
    .get("/urls?limit=0")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 400);
});

it("GET /urls should reject limit greater than 100", async () => {
  const token = (await createUser("limit101@example.com")).token;

  const res = await request(app)
    .get("/urls?limit=101")
    .set("Authorization", `Bearer ${token}`);

  assert.strictEqual(res.status, 400);
});
it("GET /open/:shortcode should return 404 for nonexistent URL", async () => {
  const res = await request(app).get("/open/doesNotExist").redirects(0);

  assert.strictEqual(res.status, 404);
});
it("GET /open/:shortcode should return 404 after URL deletion", async () => {
  const user = await createUser("deleted-open@example.com");

  const url = await createUrl(user.token);
  const shortCode = url.shortURL.split("/").pop();

  const deleteRes = await request(app)
    .delete(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${user.token}`);

  assert.strictEqual(deleteRes.status, 200);

  const openRes = await request(app).get(`/open/${shortCode}`).redirects(0);

  assert.strictEqual(openRes.status, 404);
});
it("POST /urls should reject non-HTTP protocols", async () => {
  const user = await createUser("protocol@example.com");

  const res = await request(app)
    .post("/urls")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      mainURL: "ftp://example.com",
    });

  assert.strictEqual(res.status, 400);
});
it("PATCH /urls/:shortcode should reject non-HTTP protocols", async () => {
  const user = await createUser("update-protocol@example.com");

  const url = await createUrl(user.token);
  const shortCode = url.shortURL.split("/").pop();

  const res = await request(app)
    .patch(`/urls/${shortCode}`)
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      mainURL: "ftp://example.com",
    });

  assert.strictEqual(res.status, 400);
});
