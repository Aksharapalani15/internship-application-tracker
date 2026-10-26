const express = require("express");
const applicationController = require("../controllers/applicationController");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const {
  createApplicationSchema,
  updateApplicationSchema,
  applicationIdParamSchema,
} = require("../validators/applicationValidators");
const { applicationQuerySchema } = require("../validators/queryValidators");

const router = express.Router();

// Enforce authentication on all application routes
router.use(authenticate);

// CSV Export endpoint (must precede /:id to prevent route shadowing)
router.get("/export", applicationController.exportApplications);

// List applications with search, filters, sorting, and pagination
router.get(
  "/",
  validate(applicationQuerySchema, "query"),
  applicationController.getApplications
);

// Create a new application record
router.post(
  "/",
  validate(createApplicationSchema, "body"),
  applicationController.createApplication
);

// Retrieve single application details
router.get(
  "/:id",
  validate(applicationIdParamSchema, "params"),
  applicationController.getApplicationById
);

// Full update of an application record
router.put(
  "/:id",
  validate(applicationIdParamSchema, "params"),
  validate(updateApplicationSchema, "body"),
  applicationController.updateApplication
);

// Delete an application record
router.delete(
  "/:id",
  validate(applicationIdParamSchema, "params"),
  applicationController.deleteApplication
);

module.exports = router;
