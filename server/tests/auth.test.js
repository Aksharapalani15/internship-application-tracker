const request = require("supertest");
const app = require("../src/app");
const { resetTestDb } = require("./setup");

describe("Authentication & Account Security Endpoints", () => {
  beforeEach(() => {
    resetTestDb();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully and return HTTP-only auth cookie", async () => {
      const payload = {
        name: "Test User",
        email: "student@example.com",
        password: "SecurePassword123!",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe("student@example.com");
      expect(res.body.data.user.password_hash).toBeUndefined();

      // Verify cookie is attached
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/internship_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it("should reject registration if email is invalid", async () => {
      const payload = {
        name: "Test User",
        email: "not-an-email",
        password: "SecurePassword123!",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
        ])
      );
    });

    it("should reject registration if password is too short", async () => {
      const payload = {
        name: "Test User",
        email: "valid@example.com",
        password: "short",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "password" }),
        ])
      );
    });

    it("should return 409 conflict when registering with an existing email", async () => {
      const payload = {
        name: "First User",
        email: "duplicate@example.com",
        password: "SecurePassword123!",
      };

      // Initial registration
      await request(app).post("/api/auth/register").send(payload);

      // Duplicate attempt
      const res = await request(app).post("/api/auth/register").send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        password: "ValidPassword123!",
      });
    });

    it("should log in successfully with valid credentials and set cookie", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "ValidPassword123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("login@example.com");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/internship_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it("should reject invalid password with generic 401 error", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "WrongPassword999!",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should reject non-existent email with generic 401 error", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "ValidPassword123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear the authentication cookie", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/logged out/i);

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/internship_token=;/);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return the authenticated user identity when valid cookie is provided", async () => {
      const regRes = await request(app).post("/api/auth/register").send({
        name: "Session User",
        email: "session@example.com",
        password: "ValidPassword123!",
      });

      const authCookie = regRes.headers["set-cookie"][0];

      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("session@example.com");
      expect(res.body.data.user.name).toBe("Session User");
    });

    it("should reject request with 401 when no auth cookie is present", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it("should reject request with 401 when invalid token is provided", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", ["internship_token=invalid_forged_token"]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
