process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test_user";
process.env.DB_PASSWORD = "test_password";
process.env.DB_NAME = "internship_tracker_test";
process.env.JWT_SECRET = "super_secret_test_jwt_key_that_is_long_and_safe_for_testing";
process.env.JWT_EXPIRES_IN = "1d";
process.env.COOKIE_NAME = "internship_token";

const { pool } = require("../src/config/db");

// In-Memory Database Store for Test Isolation
const store = {
  users: [],
  applications: [],
  userIdSeq: 1,
  appIdSeq: 1,
};

function resetTestDb() {
  store.users = [];
  store.applications = [];
  store.userIdSeq = 1;
  store.appIdSeq = 1;
}

/**
 * High-fidelity SQL query engine mock for isolated integration testing
 */
async function mockQuery(sql, params = []) {
  const normalizedSql = sql.replace(/\s+/g, " ").trim();

  // Health check query
  if (normalizedSql.includes("SELECT 1")) {
    return [[{ health_check: 1 }]];
  }

  // 1. Check existing user email for uniqueness
  if (
    normalizedSql.startsWith("SELECT id FROM users WHERE email = ? LIMIT 1") ||
    normalizedSql.startsWith("SELECT id FROM users WHERE email = ?")
  ) {
    const email = params[0];
    const found = store.users.filter((u) => u.email.toLowerCase() === email.toLowerCase());
    return [found.map((u) => ({ id: u.id }))];
  }

  // 2. Check email collision on profile update (excluding current user ID)
  if (normalizedSql.includes("SELECT id FROM users WHERE email = ? AND id !=")) {
    const [email, userId] = params;
    const found = store.users.filter(
      (u) => u.email.toLowerCase() === email.toLowerCase() && Number(u.id) !== Number(userId)
    );
    return [found.map((u) => ({ id: u.id }))];
  }

  // 3. User lookup by ID
  if (normalizedSql.startsWith("SELECT") && normalizedSql.includes("FROM users WHERE id = ?")) {
    const userId = Number(params[0]);
    const found = store.users.find((u) => Number(u.id) === userId);
    if (!found) {
      return [[]];
    }
    const userCopy = { ...found };
    if (!normalizedSql.includes("password_hash")) {
      delete userCopy.password_hash;
    }
    return [[userCopy]];
  }

  // 4. User lookup by email for login
  if (normalizedSql.startsWith("SELECT") && normalizedSql.includes("FROM users WHERE email = ?")) {
    const email = params[0];
    const found = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return [found ? [{ ...found }] : []];
  }

  // 5. Insert new user
  if (normalizedSql.startsWith("INSERT INTO users")) {
    const [name, email, passwordHash] = params;
    // Enforce unique constraint
    const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error("Duplicate entry for key 'idx_users_unique_email'");
      err.code = "ER_DUP_ENTRY";
      throw err;
    }

    const newUser = {
      id: store.userIdSeq++,
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.users.push(newUser);
    return [{ insertId: newUser.id, affectedRows: 1 }];
  }

  // 6. Update user profile
  if (normalizedSql.startsWith("UPDATE users SET")) {
    const userId = Number(params[params.length - 1]);
    const user = store.users.find((u) => Number(u.id) === userId);
    if (user) {
      if (normalizedSql.includes("name = ?") && normalizedSql.includes("email = ?")) {
        user.name = params[0];
        user.email = params[1].toLowerCase();
      } else if (normalizedSql.includes("name = ?")) {
        user.name = params[0];
      } else if (normalizedSql.includes("email = ?")) {
        user.email = params[0].toLowerCase();
      }
      user.updated_at = new Date().toISOString();
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 7. Insert application
  if (normalizedSql.startsWith("INSERT INTO applications")) {
    const [
      userId, companyName, role, description, companyWebsite,
      applicationUrl, location, workMode, internshipType,
      stipendAmount, stipendCurrency, duration,
      applicationDeadline, dateApplied, status,
      notes, nextAction, followUpDate,
    ] = params;

    const newApp = {
      id: store.appIdSeq++,
      user_id: Number(userId),
      company_name: companyName,
      role,
      description: description || null,
      company_website: companyWebsite || null,
      application_url: applicationUrl || null,
      location: location || null,
      work_mode: workMode || "Onsite",
      internship_type: internshipType || null,
      stipend_amount: stipendAmount !== undefined ? stipendAmount : null,
      stipend_currency: stipendCurrency || "INR",
      duration: duration || null,
      application_deadline: applicationDeadline || null,
      date_applied: dateApplied || null,
      status: status || "Applied",
      notes: notes || null,
      next_action: nextAction || null,
      follow_up_date: followUpDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.applications.push(newApp);
    return [{ insertId: newApp.id, affectedRows: 1 }];
  }

  // 8. Application count matching filters
  if (normalizedSql.startsWith("SELECT COUNT(*) AS total FROM applications")) {
    const userId = Number(params[0]);
    let filtered = store.applications.filter((a) => Number(a.user_id) === userId);

    let pIdx = 1;
    if (normalizedSql.includes("(company_name LIKE ? OR role LIKE ?)")) {
      const pattern = params[pIdx].replace(/%/g, "").toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.company_name.toLowerCase().includes(pattern) ||
          a.role.toLowerCase().includes(pattern)
      );
      pIdx += 2;
    }
    if (normalizedSql.includes("status = ?")) {
      const st = params[pIdx++];
      filtered = filtered.filter((a) => a.status === st);
    }
    if (normalizedSql.includes("work_mode = ?")) {
      const wm = params[pIdx++];
      filtered = filtered.filter((a) => a.work_mode === wm);
    }
    if (normalizedSql.includes("internship_type = ?")) {
      const it = params[pIdx++];
      filtered = filtered.filter((a) => a.internship_type === it);
    }
    if (normalizedSql.includes("date_applied >=")) {
      const sd = params[pIdx++];
      filtered = filtered.filter((a) => a.date_applied && a.date_applied >= sd);
    }
    if (normalizedSql.includes("date_applied <=")) {
      const ed = params[pIdx++];
      filtered = filtered.filter((a) => a.date_applied && a.date_applied <= ed);
    }

    return [[{ total: filtered.length }]];
  }

  // 9. Single application lookup by ID and user_id
  if (
    normalizedSql.startsWith("SELECT * FROM applications WHERE id = ? AND user_id = ?")
  ) {
    const [appId, userId] = params;
    const found = store.applications.find(
      (a) => Number(a.id) === Number(appId) && Number(a.user_id) === Number(userId)
    );
    return [found ? [{ ...found }] : []];
  }

  // 10. Update application
  if (normalizedSql.startsWith("UPDATE applications SET")) {
    const appId = Number(params[params.length - 2]);
    const userId = Number(params[params.length - 1]);

    const app = store.applications.find(
      (a) => Number(a.id) === appId && Number(a.user_id) === userId
    );

    if (app) {
      app.company_name = params[0];
      app.role = params[1];
      app.description = params[2];
      app.company_website = params[3];
      app.application_url = params[4];
      app.location = params[5];
      app.work_mode = params[6];
      app.internship_type = params[7];
      app.stipend_amount = params[8];
      app.stipend_currency = params[9];
      app.duration = params[10];
      app.application_deadline = params[11];
      app.date_applied = params[12];
      app.status = params[13];
      app.notes = params[14];
      app.next_action = params[15];
      app.follow_up_date = params[16];
      app.updated_at = new Date().toISOString();
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 11. Delete application
  if (normalizedSql.startsWith("DELETE FROM applications WHERE id = ? AND user_id = ?")) {
    const [appId, userId] = params;
    const index = store.applications.findIndex(
      (a) => Number(a.id) === Number(appId) && Number(a.user_id) === Number(userId)
    );
    if (index !== -1) {
      store.applications.splice(index, 1);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 12. Paginated applications list
  if (
    normalizedSql.startsWith("SELECT * FROM applications WHERE") &&
    normalizedSql.includes("LIMIT ? OFFSET ?")
  ) {
    const userId = Number(params[0]);
    let filtered = store.applications.filter((a) => Number(a.user_id) === userId);

    let pIdx = 1;
    if (normalizedSql.includes("(company_name LIKE ? OR role LIKE ?)")) {
      const pattern = params[pIdx].replace(/%/g, "").toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.company_name.toLowerCase().includes(pattern) ||
          a.role.toLowerCase().includes(pattern)
      );
      pIdx += 2;
    }
    if (normalizedSql.includes("status = ?")) {
      const st = params[pIdx++];
      filtered = filtered.filter((a) => a.status === st);
    }
    if (normalizedSql.includes("work_mode = ?")) {
      const wm = params[pIdx++];
      filtered = filtered.filter((a) => a.work_mode === wm);
    }
    if (normalizedSql.includes("internship_type = ?")) {
      const it = params[pIdx++];
      filtered = filtered.filter((a) => a.internship_type === it);
    }
    if (normalizedSql.includes("date_applied >=")) {
      const sd = params[pIdx++];
      filtered = filtered.filter((a) => a.date_applied && a.date_applied >= sd);
    }
    if (normalizedSql.includes("date_applied <=")) {
      const ed = params[pIdx++];
      filtered = filtered.filter((a) => a.date_applied && a.date_applied <= ed);
    }

    const limit = Number(params[params.length - 2]);
    const offset = Number(params[params.length - 1]);

    const result = filtered.slice(offset, offset + limit);
    return [result];
  }

  // 13. CSV Export lookup
  if (
    normalizedSql.startsWith("SELECT * FROM applications WHERE user_id = ? ORDER BY")
  ) {
    const userId = Number(params[0]);
    const rows = store.applications.filter((a) => Number(a.user_id) === userId);
    return [rows];
  }

  // 14. Dashboard Stats Query
  if (
    normalizedSql.includes("COUNT(*) AS totalApplications") &&
    normalizedSql.includes("COUNT(CASE WHEN status = 'Saved'")
  ) {
    const userId = Number(params[0]);
    const apps = store.applications.filter((a) => Number(a.user_id) === userId);

    const stats = {
      totalApplications: apps.length,
      savedCount: apps.filter((a) => a.status === "Saved").length,
      appliedCount: apps.filter((a) => a.status === "Applied").length,
      assessmentCount: apps.filter((a) => a.status === "Assessment").length,
      interviewCount: apps.filter((a) => a.status === "Interview").length,
      offerCount: apps.filter((a) => a.status === "Offer").length,
      rejectedCount: apps.filter((a) => a.status === "Rejected").length,
      withdrawnCount: apps.filter((a) => a.status === "Withdrawn").length,
    };
    return [[stats]];
  }

  // 15. Dashboard Activity Timeline Query
  if (normalizedSql.includes("DATE_FORMAT(COALESCE(date_applied")) {
    const userId = Number(params[0]);
    const apps = store.applications.filter((a) => Number(a.user_id) === userId);

    const monthCounts = {};
    apps.forEach((a) => {
      const d = a.date_applied || a.created_at.slice(0, 10);
      const period = d.slice(0, 7);
      monthCounts[period] = (monthCounts[period] || 0) + 1;
    });

    const rows = Object.keys(monthCounts)
      .sort()
      .map((p) => ({ period: p, count: monthCounts[p] }));

    return [rows];
  }

  // 16. Upcoming/Overdue Deadlines & Follow-ups
  if (normalizedSql.includes("FROM applications WHERE user_id = ?")) {
    const userId = Number(params[0]);
    const apps = store.applications.filter((a) => Number(a.user_id) === userId);

    const today = new Date().toISOString().slice(0, 10);

    if (normalizedSql.includes("application_deadline >= CURRENT_DATE()")) {
      const res = apps
        .filter((a) => a.application_deadline && a.application_deadline >= today && ["Saved", "Applied"].includes(a.status))
        .map((a) => ({ id: a.id, company_name: a.company_name, role: a.role, status: a.status, date: a.application_deadline }));
      return [res];
    }
    if (normalizedSql.includes("application_deadline < CURRENT_DATE()")) {
      const res = apps
        .filter((a) => a.application_deadline && a.application_deadline < today && ["Saved", "Applied"].includes(a.status))
        .map((a) => ({ id: a.id, company_name: a.company_name, role: a.role, status: a.status, date: a.application_deadline }));
      return [res];
    }
    if (normalizedSql.includes("follow_up_date >= CURRENT_DATE()")) {
      const res = apps
        .filter((a) => a.follow_up_date && a.follow_up_date >= today && !["Offer", "Rejected", "Withdrawn"].includes(a.status))
        .map((a) => ({ id: a.id, company_name: a.company_name, role: a.role, status: a.status, next_action: a.next_action, date: a.follow_up_date }));
      return [res];
    }
    if (normalizedSql.includes("follow_up_date < CURRENT_DATE()")) {
      const res = apps
        .filter((a) => a.follow_up_date && a.follow_up_date < today && !["Offer", "Rejected", "Withdrawn"].includes(a.status))
        .map((a) => ({ id: a.id, company_name: a.company_name, role: a.role, status: a.status, next_action: a.next_action, date: a.follow_up_date }));
      return [res];
    }
  }

  // Fallback for unexpected queries
  return [[]];
}

// Hook into pool.query
jest.spyOn(pool, "query").mockImplementation(mockQuery);

module.exports = {
  store,
  resetTestDb,
};
