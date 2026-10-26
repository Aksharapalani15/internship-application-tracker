const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Enforce authentication on all dashboard routes
router.use(authenticate);

// Aggregated counts and conversion rates
router.get("/stats", dashboardController.getStats);

// Monthly/weekly activity counts for charting
router.get("/activity", dashboardController.getActivity);

// Upcoming deadlines and follow-up reminders
router.get("/upcoming-deadlines", dashboardController.getUpcomingDeadlines);

module.exports = router;
