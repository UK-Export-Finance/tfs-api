/**
 * Regex patterns used in test files.
 * These are primarily used for testing the regexToString helper function.
 */

/**
 * Simple test regex - Matches the literal string "test".
 *
 * Examples:
 * - `test` ✓
 *
 * Does not match:
 * - `Test` (case-sensitive)
 * - `testing` (partial match only)
 */
const TEST_STRING = /test/;

/**
 * Test regex with escaped forward slash - Matches "test" followed by a forward slash followed by "test".
 *
 * Examples:
 * - `test/test` ✓
 *
 * Does not match:
 * - `testtest` (no forward slash)
 * - `test\\test` (backslash instead of forward slash)
 */
const TEST_WITH_ESCAPED_SLASH = /test\/test/;

/**
 * Complex validation regex with negative lookahead and lookbehind assertions.
 * Matches strings that start with a non-whitespace character, contain word characters,
 * hyphens, periods, parentheses or spaces, and end with a non-whitespace/non-period character.
 * Used for testing complex escape sequences in the regexToString helper.
 *
 * Examples:
 * - `Hello (World)` ✓
 * - `Test-Value` ✓
 *
 * Does not match:
 * - ` leading space` (starts with space)
 * - `trailing space ` (ends with space)
 * - `ends with period.` (ends with period)
 */
const COMPLEX_WITH_ASSERTIONS = /^(?!\s)[\w\-.()\s]+(?<![\s.])$/;

/**
 * Test regex with backslashes and forward slashes.
 * Matches strings containing word characters, hyphens, forward slashes, backslashes, parentheses and spaces.
 * Used for testing escape sequences in paths and URIs.
 *
 * Examples:
 * - `path/to/file` ✓
 * - `C:\Windows\System32` ✓
 * - `test (value)` ✓
 *
 * Does not match:
 * - `test@value` (@ is not allowed)
 */
const WITH_BACKSLASHES_AND_SLASHES = /^[\w\-:/\\()\s]+$/;

export const TEST = {
  TEST_STRING,
  TEST_WITH_ESCAPED_SLASH,
  COMPLEX_WITH_ASSERTIONS,
  WITH_BACKSLASHES_AND_SLASHES,
};
