const authService = require("../services/authService");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookies");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Handle new user registration
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  // Set secure HTTP-only authentication cookie
  setAuthCookie(res, token);

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user,
    },
  });
});

/**
 * Handle user login
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  // Set secure HTTP-only authentication cookie
  setAuthCookie(res, token);

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      user,
    },
  });
});

/**
 * Handle user logout
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * Retrieve currently authenticated user identity
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    },
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
