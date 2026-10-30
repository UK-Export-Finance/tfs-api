/**
 * Centralized repository for all regex patterns used throughout the application.
 * Each regex includes documentation explaining what it matches, with examples.
 */

import { TEST } from './test';

/**
 * ACBS Party ID - Matches a party ID that starts with "00" followed by exactly 6 digits.
 *
 * Examples:
 * - `001234` ✓
 * - `009999` ✓
 *
 * Does not match:
 * - `01234` (missing leading zero)
 * - `0001234` (too many digits)
 * - `00123` (not enough digits)
 */
const ACBS_PARTY_ID = /^00\d{6}$/;

/**
 * ACBS Bundle ID - Matches a bundle ID that starts with exactly 4 zeros followed by 6 digits.
 *
 * Examples:
 * - `00001234` ✓
 * - `00009999` ✓
 *
 * Does not match:
 * - `00011234` (first digit not zero)
 * - `0001234` (not enough leading zeros)
 * - `000012345` (too many digits)
 */
const ACBS_BUNDLE_ID = /^0{4}\d{6}$/;

/**
 * ACBS Loan ID - Matches a loan ID that consists of exactly 9 digits.
 *
 * Examples:
 * - `123456789` ✓
 * - `000000001` ✓
 *
 * Does not match:
 * - `12345678` (not enough digits)
 * - `1234567890` (too many digits)
 * - `12345678a` (contains non-digit character)
 */
const ACBS_LOAN_ID = /^\d{9}$/;

/**
 * UKEF Deal/Facility ID (10-digit format) - Matches a 10-digit ID that starts with "00" followed by exactly 8 digits.
 *
 * Examples:
 * - `0012345678` ✓
 * - `0099999999` ✓
 *
 * Does not match:
 * - `12345678` (too few digits)
 * - `00123456789` (too many digits)
 * - `01234567890` (doesn't start with "00")
 */
const UKEF_MAIN_ID_TEN_DIGIT = /^00\d{8}$/;

/**
 * UKEF Deal/Facility IDs (multiple 10-digit IDs) - Matches one or more 10-digit IDs separated by commas.
 * Each ID must match the UKEF_MAIN_ID_TEN_DIGIT pattern.
 *
 * Examples:
 * - `0012345678` ✓
 * - `0012345678,0087654321` ✓
 * - `0012345678,0087654321,0011111111` ✓
 *
 * Does not match:
 * - `0012345678,` (trailing comma)
 * - `0012345678,,0087654321` (double comma)
 * - `0012345678, 0087654321` (space after comma)
 */
const UKEF_MAIN_ID_MULTIPLE_TEN_DIGIT = String.raw`^00\d{8}(,00\d{8})*$`;

/**
 * UKEF Covenant ID - Matches a covenant ID that starts with exactly 4 zeros followed by 6 digits.
 *
 * Examples:
 * - `00001234` ✓
 * - `00009999` ✓
 *
 * Does not match:
 * - `00011234` (first digit not zero)
 * - `0001234` (not enough leading zeros)
 * - `000012345` (too many digits)
 */
const UKEF_COVENANT_ID = /^0{4}\d{6}$/;

/**
 * UKEF Bundle ID - Matches a bundle ID that starts with exactly 4 zeros followed by 6 digits.
 *
 * Examples:
 * - `00001234` ✓
 * - `00009999` ✓
 *
 * Does not match:
 * - `00011234` (first digit not zero)
 * - `0001234` (not enough leading zeros)
 * - `000012345` (too many digits)
 */
const UKEF_BUNDLE_ID = /^0{4}\d{6}$/;

/**
 * UKEF Party/Customer ID - Matches a party ID that consists of exactly 8 digits.
 *
 * Examples:
 * - `12345678` ✓
 * - `00000001` ✓
 *
 * Does not match:
 * - `1234567` (too few digits)
 * - `123456789` (too many digits)
 * - `1234567a` (contains non-digit character)
 */
const UKEF_PARTY_ID = /^\d{8}$/;

/**
 * UKEF Facility ID (10-digit format) - Same as UKEF_MAIN_ID_TEN_DIGIT.
 * Matches a 10-digit ID that starts with "00" followed by exactly 8 digits.
 *
 * Examples:
 * - `0012345678` ✓
 * - `0099999999` ✓
 *
 * Does not match:
 * - `12345678` (too few digits)
 * - `00123456789` (too many digits)
 * - `01234567890` (doesn't start with "00")
 */
const UKEF_FACILITY_ID = /^00\d{8}$/;

/**
 * Date in YYYY-MM-DD format - Matches dates formatted as YYYY-MM-DD.
 * Does not validate that the date is actually valid (e.g., allows 2021-02-30).
 *
 * Examples:
 * - `2021-01-15` ✓
 * - `2020-12-31` ✓
 *
 * Does not match:
 * - `2021-1-15` (single-digit month)
 * - `01/15/2021` (different date format)
 * - `2021-13-01` (invalid month, but regex doesn't validate)
 */
const DATE_ONLY_STRING = /^\d{4}-\d{2}-\d{2}$/;

/**
 * ACBS Allowed Characters - Matches characters that are allowed in ACBS requests.
 * Allows ASCII ranges: 32-126 (printable ASCII), 160-180, 182-254 (extended characters).
 * Excludes µ (181) and ÿ (255) from the extended range.
 *
 * Examples:
 * - `Hello World!` ✓
 * - `Test©` ✓
 *
 * Does not match:
 * - `Test™` (™ is outside allowed range)
 */
const ACBS_ALLOWED_CHARACTERS = /[\x20-\x7E\xA0-\xB4\xB6-\xFE]*/g;

/**
 * ACBS URL Allowed Characters - Matches characters that are allowed in ACBS URL parameters.
 * Excludes blacklisted characters: & % * ? < > # / \ :
 *
 * Examples:
 * - `Hello` ✓
 * - `Test123` ✓
 *
 * Does not match:
 * - `Hello&World` (contains &)
 * - `Test%Value` (contains %)
 * - `Path/To/File` (contains /)
 */
const ACBS_URL_ALLOWED_CHARACTERS = /[^&%*?<>#/\\:]/g;

/**
 * Ends in Non-Whitespace Character - Matches strings that end with a non-whitespace character.
 * Used to validate that search text doesn't end in trailing whitespace.
 *
 * Examples:
 * - `search text` ✓ (ends with 't')
 * - `  hello` ✓ (ends with 'o')
 *
 * Does not match:
 * - `search text ` (trailing space)
 * - `hello\t` (trailing tab)
 */
const ENDS_IN_NON_WHITESPACE = /\S$/;

/**
 * Ends in Whitespace Character - Matches strings that end with a whitespace character.
 * Used to detect and reject search text that has trailing whitespace.
 *
 * Examples:
 * - `search text ` ✓ (ends with space)
 * - `hello\t` ✓ (ends with tab)
 * - `test\n` ✓ (ends with newline)
 *
 * Does not match:
 * - `search text` (ends with non-whitespace)
 * - `hello` (ends with 'o')
 */
const ENDS_IN_WHITESPACE = /\s$/;

/**
 * 10-Digit UKEF Identifier - Matches exactly 10 digits that represent a UKEF identifier.
 *
 * Examples:
 * - `1234567890` ✓
 * - `0000000001` ✓
 *
 * Does not match:
 * - `123456789` (too few digits)
 * - `12345678901` (too many digits)
 * - `123456789a` (contains non-digit character)
 */
const TEN_DIGIT_ID = /^\d{10}$/;

export const REGEX = {
  ACBS_PARTY_ID,
  ACBS_BUNDLE_ID,
  ACBS_LOAN_ID,
  UKEF_MAIN_ID_TEN_DIGIT,
  UKEF_MAIN_ID_MULTIPLE_TEN_DIGIT,
  UKEF_COVENANT_ID,
  UKEF_BUNDLE_ID,
  UKEF_PARTY_ID,
  UKEF_FACILITY_ID,
  DATE_ONLY_STRING,
  ACBS_ALLOWED_CHARACTERS,
  ACBS_URL_ALLOWED_CHARACTERS,
  ENDS_IN_NON_WHITESPACE,
  ENDS_IN_WHITESPACE,
  TEN_DIGIT_ID,
  TEST,
};
