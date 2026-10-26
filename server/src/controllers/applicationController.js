const applicationService = require("../services/applicationService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Create a new application
 * POST /api/applications
 */
const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(
    req.user.id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Application created successfully",
    data: {
      application,
    },
  });
});

/**
 * List paginated applications with search and filters
 * GET /api/applications
 */
const getApplications = asyncHandler(async (req, res) => {
  const { applications, pagination } = await applicationService.getApplications(
    req.user.id,
    req.query
  );

  return res.status(200).json({
    success: true,
    data: applications,
    pagination,
  });
});

/**
 * Retrieve a single application by ID
 * GET /api/applications/:id
 */
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(
    req.user.id,
    req.params.id
  );

  return res.status(200).json({
    success: true,
    data: {
      application,
    },
  });
});

/**
 * Update an existing application
 * PUT /api/applications/:id
 */
const updateApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplication(
    req.user.id,
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Application updated successfully",
    data: {
      application,
    },
  });
});

/**
 * Delete an application
 * DELETE /api/applications/:id
 */
const deleteApplication = asyncHandler(async (req, res) => {
  await applicationService.deleteApplication(req.user.id, req.params.id);

  return res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
});

/**
 * Export applications to CSV
 * GET /api/applications/export
 */
const exportApplications = asyncHandler(async (req, res) => {
  const csvData = await applicationService.exportApplications(req.user.id);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="internship-applications.csv"'
  );

  return res.status(200).send(csvData);
});

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  exportApplications,
};
