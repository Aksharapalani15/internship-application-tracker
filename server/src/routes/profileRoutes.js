const express = require("express");
const profileController = require("../controllers/profileController");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const { updateProfileSchema } = require("../validators/profileValidators");

const router = express.Router();

// Enforce authentication on all profile routes
router.use(authenticate);

// View authenticated user profile
router.get("/", profileController.getProfile);

// Update authenticated user profile
router.put(
  "/",
  validate(updateProfileSchema, "body"),
  profileController.updateProfile
);

module.exports = router;
