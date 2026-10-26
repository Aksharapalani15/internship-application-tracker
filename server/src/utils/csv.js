/**
 * CSV Generation Utility with Protection against Spreadsheet Formula Injection
 * (CSV Injection / CWE-1236)
 */

/**
 * Characters that trigger formula execution in spreadsheet software (Excel, Sheets, Calc).
 */
const FORMULA_TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Sanitizes and escapes an individual cell value for safe CSV output.
 * 
 * 1. Checks for spreadsheet formula triggers and prepends a single quote (')
 *    to prevent malicious command execution when opened in Excel/Sheets.
 * 2. Escapes internal double quotes by doubling them (" -> "").
 * 3. Wraps strings containing commas, newlines, or quotes in enclosing quotes.
 * 
 * @param {any} value - Cell data value
 * @returns {string} Safe, escaped CSV string representation
 */
function sanitizeCell(value) {
  if (value === null || value === undefined) {
    return "";
  }

  let stringValue = String(value);

  // Neutralize formula injection
  if (
    typeof stringValue === "string" &&
    stringValue.length > 0 &&
    FORMULA_TRIGGERS.includes(stringValue.charAt(0))
  ) {
    stringValue = `'${stringValue}`;
  }

  // If cell contains commas, quotes, or newlines, escape internal quotes and wrap in quotes
  if (
    stringValue.includes('"') ||
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    const escapedQuotes = stringValue.replace(/"/g, '""');
    return `"${escapedQuotes}"`;
  }

  return stringValue;
}

/**
 * Generates formatted CSV text from columns and an array of record objects.
 * 
 * @param {Array<{ key: string, label: string }>} columns - Ordered column definitions
 * @param {Array<object>} records - Data rows
 * @returns {string} Complete formatted CSV text
 */
function generateCsv(columns, records) {
  const headerLine = columns.map((col) => sanitizeCell(col.label)).join(",");

  const rows = records.map((record) => {
    return columns.map((col) => sanitizeCell(record[col.key])).join(",");
  });

  return [headerLine, ...rows].join("\r\n");
}

module.exports = {
  sanitizeCell,
  generateCsv,
};
