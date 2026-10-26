const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from server root .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { pool, closePool } = require("../src/config/db");

async function seedDatabase() {
  console.log("\x1b[34m[Seed] Starting database seed routine...\x1b[0m");

  try {
    const passwordHash = await bcrypt.hash("Password123!", 10);

    // 1. Create or ensure test user accounts
    console.log("[Seed] Creating test users...");
    await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
      ["Alex Chen", "alex@example.com", passwordHash]
    );

    await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
      ["Priya Sharma", "priya@example.com", passwordHash]
    );

    const [alexRows] = await pool.query(
      "SELECT id FROM users WHERE email = 'alex@example.com'"
    );
    const [priyaRows] = await pool.query(
      "SELECT id FROM users WHERE email = 'priya@example.com'"
    );

    const alexId = alexRows[0].id;
    const priyaId = priyaRows[0].id;

    console.log(`[Seed] Alex user ID: ${alexId}, Priya user ID: ${priyaId}`);

    // Clear existing applications for these test users to enable idempotent runs
    await pool.query(
      "DELETE FROM applications WHERE user_id IN (?, ?)",
      [alexId, priyaId]
    );

    // 2. Sample applications for Alex Chen
    console.log("[Seed] Inserting sample applications for Alex Chen...");
    const alexApplications = [
      [
        alexId,
        "Google",
        "Software Engineering Intern - Cloud",
        "Backend distributed systems engineering with Go and C++ on Kubernetes infrastructure.",
        "https://careers.google.com",
        "https://careers.google.com/jobs/results/12345",
        "Bengaluru, India",
        "Hybrid",
        "Summer 2025",
        110000.0,
        "INR",
        "3 months",
        "2026-11-15",
        "2026-10-10",
        "Interview",
        "Round 1 technical screening completed. Preparing graph algorithms and dynamic programming.",
        "System design review and graph problem practice",
        "2026-10-28",
      ],
      [
        alexId,
        "Microsoft",
        "Software Development Intern - Azure Core",
        "Working on Azure serverless infrastructure and API runtime optimizations.",
        "https://careers.microsoft.com",
        "https://careers.microsoft.com/jobs/98765",
        "Hyderabad, India",
        "Hybrid",
        "Summer 2025",
        95000.0,
        "INR",
        "2 months",
        "2026-11-30",
        "2026-10-05",
        "Assessment",
        "Completed online assessment on Codility. Passed 3/3 problems.",
        "Await recruiter email for technical interview scheduling",
        "2026-10-30",
      ],
      [
        alexId,
        "Atlassian",
        "Full Stack Developer Intern",
        "Jira frontend/backend performance and microservices in Node.js and React.",
        "https://atlassian.com/company/careers",
        "https://atlassian.com/jobs/45678",
        "Bengaluru, India",
        "Remote",
        "Summer 2025",
        85000.0,
        "INR",
        "6 months",
        "2026-10-01",
        "2026-09-15",
        "Offer",
        "Received formal written offer letter after 3 rounds of interviews!",
        "Review offer terms and return signed acceptance letter",
        "2026-10-26",
      ],
      [
        alexId,
        "Amazon",
        "Software Development Engineer Intern (SDE)",
        "AWS DynamoDB caching tier acceleration project.",
        "https://amazon.jobs",
        "https://amazon.jobs/en/jobs/24680",
        "Bengaluru, India",
        "Onsite",
        "Summer 2025",
        80000.0,
        "INR",
        "3 months",
        "2026-09-20",
        "2026-09-01",
        "Rejected",
        "Received rejection notice after final managerial interview.",
        "Request feedback from recruiter on areas of technical improvement",
        null,
      ],
      [
        alexId,
        "Stripe",
        "Backend Engineering Intern",
        "Payments infrastructure, ledger reliability, and high-throughput transaction processing.",
        "https://stripe.com/jobs",
        "https://stripe.com/jobs/11223",
        "Remote",
        "Remote",
        "Summer 2025",
        120000.0,
        "INR",
        "3 months",
        "2026-12-01",
        null,
        "Saved",
        "Draft application. Need to polish payment gateway side project on resume first.",
        "Finalize resume and submit application form",
        "2026-11-01",
      ],
    ];

    const insertSql = `
      INSERT INTO applications (
        user_id, company_name, role, description, company_website,
        application_url, location, work_mode, internship_type,
        stipend_amount, stipend_currency, duration,
        application_deadline, date_applied, status,
        notes, next_action, follow_up_date
      ) VALUES ?
    `;

    await pool.query(insertSql, [alexApplications]);

    // 3. Sample applications for Priya Sharma (multi-user isolation verification)
    console.log("[Seed] Inserting sample applications for Priya Sharma...");
    const priyaApplications = [
      [
        priyaId,
        "Adobe",
        "Machine Learning Intern",
        "Generative media models and image processing pipelines with Python and PyTorch.",
        "https://adobe.com/careers",
        "https://adobe.com/jobs/77889",
        "Noida, India",
        "Hybrid",
        "Summer 2025",
        90000.0,
        "INR",
        "3 months",
        "2026-11-10",
        "2026-10-12",
        "Applied",
        "Application submitted through campus placement portal.",
        "Follow up with campus placement coordinator",
        "2026-11-05",
      ],
      [
        priyaId,
        "Uber",
        "Software Engineering Intern",
        "Driver dispatch matching algorithm and geospatial query optimizations.",
        "https://uber.com/careers",
        "https://uber.com/jobs/33445",
        "Bengaluru, India",
        "Onsite",
        "Summer 2025",
        100000.0,
        "INR",
        "3 months",
        "2026-10-15",
        "2026-09-28",
        "Interview",
        "Technical round 2 scheduled for next Tuesday.",
        "Review Dijkstra and A* pathfinding algorithms",
        "2026-10-27",
      ],
    ];

    await pool.query(insertSql, [priyaApplications]);

    console.log("\x1b[32m[Seed] Database seed completed successfully!\x1b[0m");
    console.log("-------------------------------------------------------------");
    console.log("Test Accounts created:");
    console.log("  1. Email: alex@example.com  | Password: Password123!");
    console.log("  2. Email: priya@example.com | Password: Password123!");
    console.log("-------------------------------------------------------------");
  } catch (error) {
    console.error("\x1b[31m[Seed] Error executing seed script:\x1b[0m", error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seedDatabase();
