const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Retrieve high-level application metrics and conversion rates
 * GET /api/dashboard/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats(req.user.id);

  return res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Retrieve timeline activity for chart visualization
 * GET /api/dashboard/activity
 */
const getActivity = asyncHandler(async (req, res) => {
  const activity = await dashboardService.getActivity(req.user.id);

  return res.status(200).json({
    success: true,
    data: activity,
  });
});

/**
 * Retrieve upcoming and overdue deadlines and follow-ups
 * GET /api/dashboard/upcoming-deadlines
 */
const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const reminders = await dashboardService.getUpcomingDeadlines(req.user.id);

  return res.status(200).json({
    success: true,
    data: reminders,
  });
});

module.exports = {
  getStats,
  getActivity,
  getUpcomingDeadlines,
};
