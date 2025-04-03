/**
 * Check that a response is a 400 response.
 * @param {Object} response: The API response
 */
export const assert400Response = (response) => {
  const { status, body } = response;

  expect(status).toBe(400);

  expect(body.error).toBe('Bad Request');
  expect(body.statusCode).toBe(400);
};
