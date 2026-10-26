/**
 * Reusable Express request validation middleware powered by Zod.
 * 
 * Validates request data against the provided Zod schema and sanitizes
 * the request object with parsed, normalized values.
 * 
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 * @param {"body" | "query" | "params"} [source="body"] - Location on the Express request to validate
 * @returns {import("express").RequestHandler}
 */
function validate(schema, source = "body") {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req[source]);
      // Overwrite request target with validated/sanitized/coerced data
      req[source] = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validate;
