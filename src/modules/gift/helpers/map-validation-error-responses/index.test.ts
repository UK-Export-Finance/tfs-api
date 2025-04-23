import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { mapValidationErrorResponses } from '.';

const { ENTITY_NAMES, API_RESPONSE_TYPES } = GIFT;

const mockEntityName = ENTITY_NAMES.COUNTERPARTY;

const mockValidationErrors = [
  {
    path: ['exitDate'],
    message: 'Expected string, received number',
  },
];

describe('modules/gift/helpers/map-validation-error-responses', () => {
  describe('when a response contains an invalid status', () => {
    it('should return an array with the invalid response', () => {
      // Arrange
      const mockResponses = [
        { status: HttpStatus.CREATED },
        { status: HttpStatus.BAD_REQUEST, data: { validationErrors: mockValidationErrors } },
      ] as AxiosResponse[];

      // Act
      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: mockResponses });

      // Assert
      const expected = [
        {
          entityName: mockEntityName,
          index: 1,
          message: mockResponses[1].data.message,
          status: mockResponses[1].status,
          type: API_RESPONSE_TYPES.ERROR,
          validationErrors: mockResponses[1].data.validationErrors,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when multiple responses contain an invalid statuses', () => {
    it('should return an array with mapped invalid responses', () => {
      // Arrange
      const mockResponses = [
        { status: HttpStatus.BAD_REQUEST, data: { validationErrors: mockValidationErrors } },
        { status: HttpStatus.CREATED },
        { status: HttpStatus.NOT_FOUND, data: { validationErrors: mockValidationErrors } },
        { status: HttpStatus.I_AM_A_TEAPOT, data: { validationErrors: mockValidationErrors } },
      ] as AxiosResponse[];

      // Act
      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: mockResponses });

      // Assert
      const expected = [
        {
          entityName: mockEntityName,
          index: 0,
          message: mockResponses[0].data.message,
          status: mockResponses[0].status,
          type: API_RESPONSE_TYPES.ERROR,
          validationErrors: mockResponses[0].data.validationErrors,
        },
        {
          entityName: mockEntityName,
          index: 2,
          message: mockResponses[2].data.message,
          status: mockResponses[2].status,
          type: API_RESPONSE_TYPES.ERROR,
          validationErrors: mockResponses[2].data.validationErrors,
        },
        {
          entityName: mockEntityName,
          index: 3,
          message: mockResponses[3].data.message,
          status: mockResponses[3].status,
          type: API_RESPONSE_TYPES.ERROR,
          validationErrors: mockResponses[3].data.validationErrors,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when all responses have a valid status', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockResponses = [{ status: HttpStatus.CREATED }, { status: HttpStatus.CREATED }, { status: HttpStatus.CREATED }] as AxiosResponse[];

      // Act
      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: mockResponses });

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('when responses is an empty array', () => {
    it('should return an empty array', () => {
      // Act
      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: [] });

      // Assert
      expect(result).toEqual([]);
    });
  });
});
