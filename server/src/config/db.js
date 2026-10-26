const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config();

/**
 * Validates required database environment configuration.
 * Exits or throws if critical credentials are completely missing in non-test environments.
 */
function validateDbConfig() {
  const isTest = process.env.NODE_ENV === "test";
  const required = ["DB_HOST", "DB_USER"];
  
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0 && !isTest) {
    throw new Error(
      `[Database Config Error] Missing required database environment variables: ${missing.join(", ")}`
    );
  }
}

validateDbConfig();

const dbName =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_NAME || "internship_tracker_test"
    : process.env.DB_NAME || "internship_tracker";

/**
 * MySQL Connection Pool Configuration
 * 
 * DESIGN DECISIONS:
 * 1. dateStrings: true - Prevents mysql2 from converting DATE columns into JavaScript
 *    Date objects, which inevitably introduces timezone shifts (e.g. UTC vs local time).
 * 2. connectionLimit: Managed connection reuse prevents port exhaustion under high concurrency.
 * 3. decimalNumbers: true - Automatically converts MySQL DECIMAL to JavaScript numbers.
 */
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "internship_app",
  password: process.env.DB_PASSWORD || "",
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
};

const pool = mysql.createPool(poolConfig);

/**
 * Tests active database connectivity.
 * Used during server startup health checks.
 */
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1 AS health_check");
    return true;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Gracefully terminates the connection pool.
 * Used during process shutdown and automated test teardown.
 */
async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  testConnection,
  closePool,
};
