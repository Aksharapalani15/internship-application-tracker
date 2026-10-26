const profileService = require("../services/profileService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Retrieve user profile
 * GET /api/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);

  return res.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
});

/**
 * Update user profile
 * PUT /api/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      profile,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
