import { HttpStatus } from '@nestjs/common';

/**
 * Check that a response is a 400 response.
 * @param {Object} response: The API response
 */
export const assert400Response = (response) => {
  const { status, body } = response;

  expect(status).toBe(HttpStatus.BAD_REQUEST);

  expect(body.error).toBe('Bad Request');

  expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
};
