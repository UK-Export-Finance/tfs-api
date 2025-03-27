/**
 * Mock 200 response
 * @param {Object} data
 * @returns {Object}
 */
export const mockResponse200 = (data: object = {}) => ({
  status: 200,
  data,
});

/**
 * Mock 201 response
 * @param {Object} data
 * @returns {Object}
 */
export const mockResponse201 = (data: object = {}) => ({
  status: 201,
  data,
});
