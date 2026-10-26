const request = require("supertest");
const app = require("../src/app");
const { resetTestDb } = require("./setup");

describe("Profile Management Endpoints", () => {
  let user1Cookie;
  let user2Cookie;

  beforeEach(async () => {
    resetTestDb();

    const res1 = await request(app).post("/api/auth/register").send({
      name: "User One",
      email: "user1@example.com",
      password: "Password123!",
    });
    user1Cookie = res1.headers["set-cookie"][0];

    const res2 = await request(app).post("/api/auth/register").send({
      name: "User Two",
      email: "user2@example.com",
      password: "Password123!",
    });
    user2Cookie = res2.headers["set-cookie"][0];
  });

  describe("GET /api/profile", () => {
    it("should return the profile details for authenticated user", async () => {
      const res = await request(app)
        .get("/api/profile")
        .set("Cookie", [user1Cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.email).toBe("user1@example.com");
      expect(res.body.data.profile.name).toBe("User One");
      expect(res.body.data.profile.password_hash).toBeUndefined();
    });
  });

  describe("PUT /api/profile", () => {
    it("should update name and email successfully", async () => {
      const res = await request(app)
        .put("/api/profile")
        .set("Cookie", [user1Cookie])
        .send({
          name: "Updated Name",
          email: "user1_new@example.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.name).toBe("Updated Name");
      expect(res.body.data.profile.email).toBe("user1_new@example.com");
    });

    it("should reject update if email format is invalid", async () => {
      const res = await request(app)
        .put("/api/profile")
        .set("Cookie", [user1Cookie])
        .send({
          email: "invalid-email-address",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe("email");
    });

    it("should return 409 conflict if updating to an email already in use by another user", async () => {
      const res = await request(app)
        .put("/api/profile")
        .set("Cookie", [user1Cookie])
        .send({
          email: "user2@example.com", // Belongs to User Two
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });
});
