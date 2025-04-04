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
      const mockResponses = [
        { status: HttpStatus.CREATED },
        { status: HttpStatus.BAD_REQUEST, data: { validationErrors: mockValidationErrors } },
      ] as AxiosResponse[];

      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: mockResponses });

      const expected = [
        {
          type: API_RESPONSE_TYPES.ERROR,
          entityName: mockEntityName,
          index: 1,
          messages: mockResponses[1].data.validationErrors,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when multiple responses contain an invalid statuses', () => {
    it('should return an array with mapped invalid responses', () => {
      const mockResponses = [
        { status: HttpStatus.BAD_REQUEST, data: { validationErrors: mockValidationErrors } },
        { status: HttpStatus.CREATED },
        { status: HttpStatus.NOT_FOUND, data: { validationErrors: mockValidationErrors } },
        { status: HttpStatus.I_AM_A_TEAPOT, data: { validationErrors: mockValidationErrors } },
      ] as AxiosResponse[];

      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: mockResponses });

      const expected = [
        {
          type: API_RESPONSE_TYPES.ERROR,
          entityName: mockEntityName,
          index: 0,
          messages: mockResponses[0].data.validationErrors,
        },
        {
          type: API_RESPONSE_TYPES.ERROR,
          entityName: mockEntityName,
          index: 2,
          messages: mockResponses[2].data.validationErrors,
        },
        {
          type: API_RESPONSE_TYPES.ERROR,
          entityName: mockEntityName,
          index: 3,
          messages: mockResponses[3].data.validationErrors,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when all responses have a valid status', () => {
    it('should return an empty array', () => {
      const mockResponses = [{ status: HttpStatus.CREATED }, { status: HttpStatus.CREATED }, { status: HttpStatus.CREATED }] as AxiosResponse[];

      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: mockResponses });

      expect(result).toEqual([]);
    });
  });

  describe('when responses is an empty array', () => {
    it('should return an empty array', () => {
      const result = mapValidationErrorResponses({ entityName: mockEntityName, responses: [] });

      expect(result).toEqual([]);
    });
  });
});
