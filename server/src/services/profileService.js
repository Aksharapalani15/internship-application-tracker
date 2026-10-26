const { pool } = require("../config/db");
const AppError = require("../utils/AppError");

/**
 * Retrieves profile of the currently authenticated user.
 * 
 * @param {number} userId 
 * @returns {Promise<object>}
 */
async function getProfile(userId) {
  const [rows] = await pool.query(
    "SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError("Profile not found", 404);
  }

  return rows[0];
}

/**
 * Updates profile fields (name, email) for the authenticated user.
 * 
 * SECURITY DECISION:
 * - Only permits mutation of user-editable fields (name, email).
 * - Checks for email collisions with other users before updating.
 * - Protects internal identifiers and password hashes from modification.
 * 
 * @param {number} userId 
 * @param {object} updates - { name, email }
 * @returns {Promise<object>}
 */
async function updateProfile(userId, updates) {
  const { name, email } = updates;

  // 1. If email is provided, check if it's already claimed by another user
  if (email) {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
      [email, userId]
    );

    if (existing.length > 0) {
      throw new AppError("An account with this email address already exists", 409, [
        { field: "email", message: "Email is already in use by another account" },
      ]);
    }
  }

  // 2. Build parameterized UPDATE statement dynamically
  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push("name = ?");
    params.push(name);
  }

  if (email !== undefined) {
    fields.push("email = ?");
    params.push(email);
  }

  if (fields.length === 0) {
    return getProfile(userId);
  }

  params.push(userId);

  await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  return getProfile(userId);
}

module.exports = {
  getProfile,
  updateProfile,
};
