const { z } = require("zod");

/**
 * Profile Update Input Validation Schema
 */
const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address")
      .max(255, "Email cannot exceed 255 characters")
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.email !== undefined,
    {
      message: "Please provide at least a name or an email to update",
    }
  );

module.exports = {
  updateProfileSchema,
};
