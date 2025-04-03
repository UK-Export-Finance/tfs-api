import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { filterResponsesWithInvalidStatus } from '.';

describe('modules/gift/helpers/filter-responses-with-invalid-status', () => {
  describe('when a response contains an invalid status', () => {
    it('should return an array with the invalid response', () => {
      const mockResponses = [{ status: HttpStatus.ACCEPTED }, { status: HttpStatus.BAD_REQUEST }] as AxiosResponse[];

      const expectedStatus = HttpStatus.ACCEPTED;

      const result = filterResponsesWithInvalidStatus({ responses: mockResponses, expectedStatus });

      const expected = [mockResponses[1]];

      expect(result).toEqual(expected);
    });
  });

  describe('when multiple responses contain an invalid statuses', () => {
    it('should return an array with the invalid responses', () => {
      const mockResponses = [
        { status: HttpStatus.BAD_REQUEST },
        { status: HttpStatus.CREATED },
        { status: HttpStatus.NOT_FOUND },
        { status: HttpStatus.I_AM_A_TEAPOT },
      ] as AxiosResponse[];

      const expectedStatus = HttpStatus.CREATED;

      const result = filterResponsesWithInvalidStatus({ responses: mockResponses, expectedStatus });

      const expected = [mockResponses[0], mockResponses[2], mockResponses[3]];

      expect(result).toEqual(expected);
    });
  });

  describe('when all responses have a valid status', () => {
    it('should return an empty array', () => {
      const mockResponses = [{ status: HttpStatus.CREATED }, { status: HttpStatus.CREATED }, { status: HttpStatus.CREATED }] as AxiosResponse[];

      const expectedStatus = HttpStatus.CREATED;

      const result = filterResponsesWithInvalidStatus({ responses: mockResponses, expectedStatus });

      expect(result).toEqual([]);
    });
  });

  describe('when responses is an empty array', () => {
    it('should return an empty array', () => {
      const expectedStatus = HttpStatus.CREATED;

      const result = filterResponsesWithInvalidStatus({ responses: [], expectedStatus });

      expect(result).toEqual([]);
    });
  });
});
