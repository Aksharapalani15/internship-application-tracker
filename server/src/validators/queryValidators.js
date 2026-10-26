const { z } = require("zod");
const { WORK_MODES, APPLICATION_STATUSES } = require("./applicationValidators");

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Allowlisted columns for sorting to prevent SQL injection in ORDER BY clauses
const ALLOWED_SORT_COLUMNS = [
  "date_applied",
  "application_deadline",
  "company_name",
  "status",
  "created_at",
];

const ALLOWED_SORT_ORDERS = ["ASC", "DESC", "asc", "desc"];

/**
 * Validation and normalization schema for application query filters and pagination
 */
const applicationQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(APPLICATION_STATUSES).optional(),
    work_mode: z.enum(WORK_MODES).optional(),
    internship_type: z.string().trim().max(100).optional(),
    startDate: z
      .string()
      .trim()
      .regex(DATE_REGEX, "startDate must be YYYY-MM-DD")
      .optional(),
    endDate: z
      .string()
      .trim()
      .regex(DATE_REGEX, "endDate must be YYYY-MM-DD")
      .optional(),
    sortBy: z
      .enum(ALLOWED_SORT_COLUMNS, {
        errorMap: () => ({
          message: `sortBy must be one of: ${ALLOWED_SORT_COLUMNS.join(", ")}`,
        }),
      })
      .default("created_at"),
    order: z
      .enum(ALLOWED_SORT_ORDERS, {
        errorMap: () => ({ message: "order must be ASC or DESC" }),
      })
      .transform((val) => val.toUpperCase())
      .default("DESC"),
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a positive integer")
      .transform(Number)
      .refine((val) => val > 0, { message: "Page must be at least 1" })
      .default("1"),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive integer")
      .transform(Number)
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      })
      .default("10"),
  })
  .refine(
    (query) => {
      if (query.startDate && query.endDate) {
        return query.startDate <= query.endDate;
      }
      return true;
    },
    {
      message: "startDate cannot be later than endDate",
      path: ["startDate"],
    }
  );

module.exports = {
  ALLOWED_SORT_COLUMNS,
  applicationQuerySchema,
};
