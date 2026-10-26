/**
 * Cookie Configuration and Utility Functions
 * 
 * Provides centralized management of HTTP-only JWT authentication cookies.
 */

const COOKIE_NAME = process.env.COOKIE_NAME || "internship_token";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns security-conscious cookie options based on the active runtime environment.
 * 
 * DESIGN DECISIONS:
 * - httpOnly: true prevents client-side script access, protecting against XSS token theft.
 * - secure: In production, requires HTTPS. In development (HTTP), false ensures cookies work locally.
 * - sameSite: 'lax' balances CSRF protection with smooth developer navigation between localhost ports.
 *   In production cross-site architectures, 'none' + secure=true can be enabled.
 */
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: ONE_DAY_MS,
  };
}

/**
 * Attaches the JWT authentication cookie to the outgoing Express response.
 * 
 * @param {import("express").Response} res 
 * @param {string} token 
 */
function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

/**
 * Clears the authentication cookie from the client by expiring it immediately.
 * Note: Must match path, sameSite, and secure attributes used when setting the cookie.
 * 
 * @param {import("express").Response} res 
 */
function clearAuthCookie(res) {
  const options = getCookieOptions();
  // Set maxAge to 0 and expire in the past
  res.clearCookie(COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}

module.exports = {
  COOKIE_NAME,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
