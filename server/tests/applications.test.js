const request = require("supertest");
const app = require("../src/app");
const { resetTestDb } = require("./setup");

describe("Applications CRUD & Authorization Endpoints", () => {
  let userACookie;
  let userBCookie;

  beforeEach(async () => {
    resetTestDb();

    // Register User A
    const resA = await request(app).post("/api/auth/register").send({
      name: "User Alpha",
      email: "alpha@example.com",
      password: "Password123!",
    });
    userACookie = resA.headers["set-cookie"][0];

    // Register User B
    const resB = await request(app).post("/api/auth/register").send({
      name: "User Beta",
      email: "beta@example.com",
      password: "Password123!",
    });
    userBCookie = resB.headers["set-cookie"][0];
  });

  describe("POST /api/applications", () => {
    it("should create a new internship application record with valid payload", async () => {
      const payload = {
        company_name: "Google",
        role: "Software Engineer Intern",
        description: "Cloud backend team",
        company_website: "https://careers.google.com",
        location: "Bengaluru",
        work_mode: "Hybrid",
        internship_type: "Summer 2025",
        stipend_amount: 100000,
        stipend_currency: "INR",
        duration: "3 months",
        application_deadline: "2026-11-01",
        date_applied: "2026-10-15",
        status: "Applied",
        notes: "Referral applied",
        next_action: "Follow up with recruiter",
        follow_up_date: "2026-10-30",
      };

      const res = await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application).toBeDefined();
      expect(res.body.data.application.company_name).toBe("Google");
      expect(res.body.data.application.role).toBe("Software Engineer Intern");
      expect(res.body.data.application.work_mode).toBe("Hybrid");
    });

    it("should reject creation if company_name or role are missing", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          location: "Bengaluru",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("should reject creation with invalid status", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "Amazon",
          role: "SDE Intern",
          status: "NonExistentStatus",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe("status");
    });

    it("should reject creation with negative stipend amount", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "Microsoft",
          role: "SWE Intern",
          stipend_amount: -500,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe("stipend_amount");
    });
  });

  describe("Multi-User Authorization & Security Isolation", () => {
    let userAAppId;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "Apple",
          role: "iOS Engineer Intern",
          status: "Interview",
        });
      userAAppId = res.body.data.application.id;
    });

    it("should allow User A to read their own application", async () => {
      const res = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.application.company_name).toBe("Apple");
    });

    it("should return 404 when User B attempts to read User A's application", async () => {
      const res = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set("Cookie", [userBCookie]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when User B attempts to update User A's application", async () => {
      const res = await request(app)
        .put(`/api/applications/${userAAppId}`)
        .set("Cookie", [userBCookie])
        .send({
          company_name: "Hacked Company",
          role: "Malicious Update",
          status: "Offer",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify User A's application remains unchanged
      const verifyRes = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set("Cookie", [userACookie]);
      expect(verifyRes.body.data.application.company_name).toBe("Apple");
    });

    it("should return 404 when User B attempts to delete User A's application", async () => {
      const res = await request(app)
        .delete(`/api/applications/${userAAppId}`)
        .set("Cookie", [userBCookie]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify application still exists for User A
      const verifyRes = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set("Cookie", [userACookie]);
      expect(verifyRes.status).toBe(200);
    });
  });

  describe("Listing, Search, Filters, Sorting, and Pagination", () => {
    beforeEach(async () => {
      // Seed 3 applications for User A
      await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "Stripe",
          role: "Payments Intern",
          work_mode: "Remote",
          status: "Applied",
          date_applied: "2026-10-01",
        });

      await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "Meta",
          role: "Production Engineer Intern",
          work_mode: "Onsite",
          status: "Interview",
          date_applied: "2026-10-10",
        });

      await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "Netflix",
          role: "Backend Intern",
          work_mode: "Remote",
          status: "Offer",
          date_applied: "2026-10-20",
        });
    });

    it("should list all applications for the authenticated user with pagination metadata", async () => {
      const res = await request(app)
        .get("/api/applications")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 10,
          totalRecords: 3,
        })
      );
    });

    it("should filter applications by search term matching company or role", async () => {
      const res = await request(app)
        .get("/api/applications?search=Meta")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].company_name).toBe("Meta");
    });

    it("should filter applications by status", async () => {
      const res = await request(app)
        .get("/api/applications?status=Offer")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].company_name).toBe("Netflix");
    });

    it("should filter applications by work mode", async () => {
      const res = await request(app)
        .get("/api/applications?work_mode=Remote")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it("should filter applications by date applied range", async () => {
      const res = await request(app)
        .get("/api/applications?startDate=2026-10-05&endDate=2026-10-15")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].company_name).toBe("Meta");
    });

    it("should reject query when startDate is later than endDate", async () => {
      const res = await request(app)
        .get("/api/applications?startDate=2026-10-20&endDate=2026-10-01")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid sort column not in allowlist", async () => {
      const res = await request(app)
        .get("/api/applications?sortBy=invalid_injection_col")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/applications/export (CSV Export & Formula Injection Prevention)", () => {
    it("should export user applications as CSV and neutralize formula injection triggers", async () => {
      // Insert an application with a dangerous formula injection payload
      await request(app)
        .post("/api/applications")
        .set("Cookie", [userACookie])
        .send({
          company_name: "=CMD|' /C calc'!A0",
          role: "+SUM(1,2)",
          status: "Applied",
          notes: "Regular, with comma, and \"quotes\"",
        });

      const res = await request(app)
        .get("/api/applications/export")
        .set("Cookie", [userACookie]);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/csv/);
      expect(res.headers["content-disposition"]).toMatch(/attachment/);

      const csvContent = res.text;
      // Formula characters must be escaped with prepended single quote
      expect(csvContent).toContain("'=CMD|' /C calc'!A0");
      expect(csvContent).toContain("'+SUM(1,2)");
      // Commas and quotes must be escaped
      expect(csvContent).toContain('"Regular, with comma, and ""quotes"""');
    });
  });
});
