apiKeyHeaderName/**
 * Represents the constant headers used in the application.
 */
export const HEADERS = {
  /**
   * Represents the content type header key.
   */
  CONTENT_TYPE: {
    KEY: 'Content-Type',
    /**
     * Represents the possible values for the content type header.
     */
    VALUES: {
      JSON: 'application/json',
    },
  },
  /**
   * Represents the x-api-key header key.
   */
  X_API_KEY: 'x-api-key',
} as const;
