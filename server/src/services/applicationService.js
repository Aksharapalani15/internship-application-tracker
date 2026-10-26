const { pool } = require("../config/db");
const AppError = require("../utils/AppError");
const { ALLOWED_SORT_COLUMNS } = require("../validators/queryValidators");
const { generateCsv } = require("../utils/csv");

/**
 * Creates a new application record owned by the authenticated user.
 * 
 * @param {number} userId 
 * @param {object} data 
 * @returns {Promise<object>}
 */
async function createApplication(userId, data) {
  const query = `
    INSERT INTO applications (
      user_id, company_name, role, description, company_website,
      application_url, location, work_mode, internship_type,
      stipend_amount, stipend_currency, duration,
      application_deadline, date_applied, status,
      notes, next_action, follow_up_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    userId,
    data.company_name,
    data.role,
    data.description || null,
    data.company_website || null,
    data.application_url || null,
    data.location || null,
    data.work_mode || "Onsite",
    data.internship_type || null,
    data.stipend_amount !== undefined ? data.stipend_amount : null,
    data.stipend_currency || "INR",
    data.duration || null,
    data.application_deadline || null,
    data.date_applied || null,
    data.status || "Applied",
    data.notes || null,
    data.next_action || null,
    data.follow_up_date || null,
  ];

  const [result] = await pool.query(query, params);
  return getApplicationById(userId, result.insertId);
}

/**
 * Retrieves paginated, filtered, and sorted application records for the user.
 * 
 * @param {number} userId 
 * @param {object} queryParams 
 * @returns {Promise<{ applications: Array<object>, pagination: object }>}
 */
async function getApplications(userId, queryParams) {
  const {
    search,
    status,
    work_mode,
    internship_type,
    startDate,
    endDate,
    sortBy = "created_at",
    order = "DESC",
    page = 1,
    limit = 10,
  } = queryParams;

  const whereClauses = ["user_id = ?"];
  const whereParams = [userId];

  // Search by company or role
  if (search) {
    whereClauses.push("(company_name LIKE ? OR role LIKE ?)");
    const searchPattern = `%${search}%`;
    whereParams.push(searchPattern, searchPattern);
  }

  // Filter by status
  if (status) {
    whereClauses.push("status = ?");
    whereParams.push(status);
  }

  // Filter by work mode
  if (work_mode) {
    whereClauses.push("work_mode = ?");
    whereParams.push(work_mode);
  }

  // Filter by internship type
  if (internship_type) {
    whereClauses.push("internship_type = ?");
    whereParams.push(internship_type);
  }

  // Filter by application date range
  if (startDate) {
    whereClauses.push("date_applied >= ?");
    whereParams.push(startDate);
  }
  if (endDate) {
    whereClauses.push("date_applied <= ?");
    whereParams.push(endDate);
  }

  const whereSql = whereClauses.join(" AND ");

  // 1. Get total record count matching filters
  const countSql = `SELECT COUNT(*) AS total FROM applications WHERE ${whereSql}`;
  const [countRows] = await pool.query(countSql, whereParams);
  const totalRecords = Number(countRows[0].total);

  // 2. Validate and apply dynamic sorting column against allowlist
  const safeSortColumn = ALLOWED_SORT_COLUMNS.includes(sortBy)
    ? sortBy
    : "created_at";
  const safeSortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // 3. Calculate pagination offset
  const offset = (page - 1) * limit;

  // 4. Fetch paginated records
  const selectSql = `
    SELECT * FROM applications
    WHERE ${whereSql}
    ORDER BY ${safeSortColumn} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `;

  // Note: mysql2 requires numbers for limit and offset
  const queryExecutionParams = [...whereParams, Number(limit), Number(offset)];
  const [applications] = await pool.query(selectSql, queryExecutionParams);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    applications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Retrieves a single application owned by the user.
 * 
 * SECURITY DECISION:
 * Returns 404 regardless of whether the record doesn't exist or belongs to another user.
 * This prevents attackers from enumerating valid application IDs across accounts.
 * 
 * @param {number} userId 
 * @param {number} applicationId 
 * @returns {Promise<object>}
 */
async function getApplicationById(userId, applicationId) {
  const [rows] = await pool.query(
    "SELECT * FROM applications WHERE id = ? AND user_id = ? LIMIT 1",
    [applicationId, userId]
  );

  if (rows.length === 0) {
    throw new AppError("Application not found", 404);
  }

  return rows[0];
}

/**
 * Updates an existing application record owned by the authenticated user.
 * 
 * @param {number} userId 
 * @param {number} applicationId 
 * @param {object} data 
 * @returns {Promise<object>}
 */
async function updateApplication(userId, applicationId, data) {
  // Ensure the application exists and is owned by this user
  await getApplicationById(userId, applicationId);

  const query = `
    UPDATE applications SET
      company_name = ?,
      role = ?,
      description = ?,
      company_website = ?,
      application_url = ?,
      location = ?,
      work_mode = ?,
      internship_type = ?,
      stipend_amount = ?,
      stipend_currency = ?,
      duration = ?,
      application_deadline = ?,
      date_applied = ?,
      status = ?,
      notes = ?,
      next_action = ?,
      follow_up_date = ?
    WHERE id = ? AND user_id = ?
  `;

  const params = [
    data.company_name,
    data.role,
    data.description || null,
    data.company_website || null,
    data.application_url || null,
    data.location || null,
    data.work_mode || "Onsite",
    data.internship_type || null,
    data.stipend_amount !== undefined ? data.stipend_amount : null,
    data.stipend_currency || "INR",
    data.duration || null,
    data.application_deadline || null,
    data.date_applied || null,
    data.status || "Applied",
    data.notes || null,
    data.next_action || null,
    data.follow_up_date || null,
    applicationId,
    userId,
  ];

  await pool.query(query, params);
  return getApplicationById(userId, applicationId);
}

/**
 * Deletes an application record owned by the authenticated user.
 * 
 * @param {number} userId 
 * @param {number} applicationId 
 * @returns {Promise<void>}
 */
async function deleteApplication(userId, applicationId) {
  const [result] = await pool.query(
    "DELETE FROM applications WHERE id = ? AND user_id = ?",
    [applicationId, userId]
  );

  if (result.affectedRows === 0) {
    throw new AppError("Application not found", 404);
  }
}

/**
 * Exports all application records owned by the authenticated user into safe CSV format.
 * 
 * @param {number} userId 
 * @returns {Promise<string>}
 */
async function exportApplications(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM applications WHERE user_id = ? ORDER BY date_applied DESC, created_at DESC",
    [userId]
  );

  const columns = [
    { key: "id", label: "Application ID" },
    { key: "company_name", label: "Company Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "work_mode", label: "Work Mode" },
    { key: "internship_type", label: "Internship Type" },
    { key: "stipend_amount", label: "Stipend Amount" },
    { key: "stipend_currency", label: "Currency" },
    { key: "location", label: "Location" },
    { key: "duration", label: "Duration" },
    { key: "date_applied", label: "Date Applied" },
    { key: "application_deadline", label: "Application Deadline" },
    { key: "follow_up_date", label: "Follow-up Date" },
    { key: "next_action", label: "Next Action" },
    { key: "company_website", label: "Company Website" },
    { key: "application_url", label: "Application URL" },
    { key: "notes", label: "Notes" },
    { key: "created_at", label: "Created At" },
  ];

  return generateCsv(columns, rows);
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  exportApplications,
};
