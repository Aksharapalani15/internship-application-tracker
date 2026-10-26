const request = require("supertest");
const app = require("../src/app");
const { resetTestDb } = require("./setup");

describe("Dashboard Analytics Endpoints", () => {
  let authCookie;

  beforeEach(async () => {
    resetTestDb();

    const regRes = await request(app).post("/api/auth/register").send({
      name: "Dashboard User",
      email: "dash@example.com",
      password: "Password123!",
    });
    authCookie = regRes.headers["set-cookie"][0];
  });

  describe("GET /api/dashboard/stats", () => {
    it("should return correct aggregate counts and conversion rates", async () => {
      // 1 Saved (draft, not submitted)
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({ company_name: "Co1", role: "R1", status: "Saved" });

      // 1 Applied
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({ company_name: "Co2", role: "R2", status: "Applied" });

      // 1 Interview
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({ company_name: "Co3", role: "R3", status: "Interview" });

      // 1 Offer
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({ company_name: "Co4", role: "R4", status: "Offer" });

      // 1 Rejected
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({ company_name: "Co5", role: "R5", status: "Rejected" });

      const res = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const stats = res.body.data;
      expect(stats.totalApplications).toBe(5);
      expect(stats.statusCounts.Saved).toBe(1);
      expect(stats.statusCounts.Applied).toBe(1);
      expect(stats.statusCounts.Interview).toBe(1);
      expect(stats.statusCounts.Offer).toBe(1);
      expect(stats.statusCounts.Rejected).toBe(1);

      // Total submitted = 5 total - 1 saved = 4
      // Reached interview or offer = 1 interview + 1 offer = 2
      // Interview conversion rate = (2 / 4) * 100 = 50.00%
      expect(stats.conversionRates.interviewConversionRate).toBe(50.0);

      // Offer conversion rate = 1 offer / (1 interview + 1 offer) * 100 = 50.00%
      expect(stats.conversionRates.offerConversionRate).toBe(50.0);
    });

    it("should safely handle zero applications without division-by-zero errors", async () => {
      const res = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.totalApplications).toBe(0);
      expect(statsSafe(res.body.data.conversionRates.interviewConversionRate)).toBe(0);
      expect(statsSafe(res.body.data.conversionRates.offerConversionRate)).toBe(0);
    });
  });

  describe("GET /api/dashboard/activity", () => {
    it("should return monthly submission frequency for frontend charts", async () => {
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({
          company_name: "CoA",
          role: "RoleA",
          status: "Applied",
          date_applied: "2026-10-01",
        });

      const res = await request(app)
        .get("/api/dashboard/activity")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty("period");
      expect(res.body.data[0]).toHaveProperty("count");
    });
  });

  describe("GET /api/dashboard/upcoming-deadlines", () => {
    it("should return categorized upcoming and overdue reminders", async () => {
      await request(app)
        .post("/api/applications")
        .set("Cookie", [authCookie])
        .send({
          company_name: "UpcomingCo",
          role: "Role1",
          status: "Applied",
          application_deadline: "2099-12-31",
          follow_up_date: "2099-12-31",
        });

      const res = await request(app)
        .get("/api/dashboard/upcoming-deadlines")
        .set("Cookie", [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("upcomingDeadlines");
      expect(res.body.data).toHaveProperty("overdueDeadlines");
      expect(res.body.data).toHaveProperty("upcomingFollowUps");
      expect(res.body.data).toHaveProperty("overdueFollowUps");
    });
  });
});

function statsSafe(val) {
  return Number(val) || 0;
}
