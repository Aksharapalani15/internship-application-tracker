const { z } = require("zod");

// Regex matching standard ISO YYYY-MM-DD calendar dates
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const optionalDateSchema = z
  .string()
  .trim()
  .regex(DATE_REGEX, "Date must follow YYYY-MM-DD format")
  .nullable()
  .optional()
  .or(z.literal("").transform(() => null));

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid web URL (e.g., https://example.com)")
  .max(255, "URL cannot exceed 255 characters")
  .nullable()
  .optional()
  .or(z.literal("").transform(() => null));

const optionalString = (maxLen) =>
  z
    .string()
    .trim()
    .max(maxLen, `Cannot exceed ${maxLen} characters`)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null));

const WORK_MODES = ["Remote", "Hybrid", "Onsite"];
const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

/**
 * Schema for creating a new application record (POST /api/applications)
 */
const createApplicationSchema = z.object({
  company_name: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(1, "Company name cannot be blank")
    .max(150, "Company name cannot exceed 150 characters"),
  role: z
    .string({ required_error: "Role title is required" })
    .trim()
    .min(1, "Role title cannot be blank")
    .max(150, "Role title cannot exceed 150 characters"),
  description: optionalString(5000),
  company_website: optionalUrlSchema,
  application_url: optionalUrlSchema,
  location: optionalString(150),
  work_mode: z
    .enum(WORK_MODES, {
      errorMap: () => ({ message: "Work mode must be Remote, Hybrid, or Onsite" }),
    })
    .default("Onsite"),
  internship_type: optionalString(100),
  stipend_amount: z
    .number({ invalid_type_error: "Stipend amount must be a number" })
    .min(0, "Stipend amount cannot be negative")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  stipend_currency: z
    .string()
    .trim()
    .min(1)
    .max(10, "Currency code cannot exceed 10 characters")
    .default("INR"),
  duration: optionalString(100),
  application_deadline: optionalDateSchema,
  date_applied: optionalDateSchema,
  status: z
    .enum(APPLICATION_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${APPLICATION_STATUSES.join(", ")}`,
      }),
    })
    .default("Applied"),
  notes: optionalString(5000),
  next_action: optionalString(255),
  follow_up_date: optionalDateSchema,
});

/**
 * Schema for updating an existing application record (PUT /api/applications/:id)
 */
const updateApplicationSchema = createApplicationSchema;

/**
 * Route parameter validation schema for application ID (:id)
 */
const applicationIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Application ID must be a positive integer")
    .transform(Number),
});

module.exports = {
  WORK_MODES,
  APPLICATION_STATUSES,
  createApplicationSchema,
  updateApplicationSchema,
  applicationIdParamSchema,
};
