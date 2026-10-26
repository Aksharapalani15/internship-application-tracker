const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const AppError = require("../utils/AppError");

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Generates a signed JSON Web Token for an authenticated user.
 * 
 * @param {object} user - User record { id, email, name }
 * @returns {string} JWT token string
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET || "fallback_dev_secret_change_in_production";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    secret,
    {
      expiresIn,
      algorithm: "HS256",
    }
  );
}

/**
 * Registers a new user account.
 * 
 * @param {object} data - { name, email, password }
 * @returns {Promise<{ user: object, token: string }>}
 */
async function registerUser({ name, email, password }) {
  // 1. Check for existing account with this normalized email
  const [existing] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (existing.length > 0) {
    throw new AppError("An account with this email address already exists", 409, [
      { field: "email", message: "Email is already registered" },
    ]);
  }

  // 2. Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // 3. Insert user record
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  const userId = result.insertId;

  // 4. Fetch created user data (excluding password hash)
  const [createdRows] = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [userId]
  );

  const newUser = createdRows[0];
  const token = generateToken(newUser);

  return {
    user: newUser,
    token,
  };
}

/**
 * Authenticates user credentials.
 * 
 * SECURITY DECISION:
 * Returns identical "Invalid email or password" error whether the email does not exist
 * or the password does not match, defeating account enumeration attacks.
 * 
 * @param {object} credentials - { email, password }
 * @returns {Promise<{ user: object, token: string }>}
 */
async function loginUser({ email, password }) {
  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (rows.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
    token,
  };
}

/**
 * Retrieves user profile details by ID.
 * 
 * @param {number} userId 
 * @returns {Promise<object>}
 */
async function getUserById(userId) {
  const [rows] = await pool.query(
    "SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError("User account not found", 404);
  }

  return rows[0];
}

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserById,
};
