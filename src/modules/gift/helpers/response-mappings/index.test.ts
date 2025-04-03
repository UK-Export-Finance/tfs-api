import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { createBadRequestObject, mapErrorResponses, mapResponsesData } from '.';

const mockValidationErrors = [
  {
    path: ['fieldA'],
    message: 'Expected string, received number',
  },
  {
    path: ['fieldB'],
    message: 'Field B must be greater than 0',
  },
];

const mockResponses = [
  {
    status: HttpStatus.BAD_REQUEST,
    data: {
      path: 'Mock path 0',
      validationErrors: mockValidationErrors,
    },
  },
  {
    status: HttpStatus.BAD_REQUEST,
    data: {
      path: 'Mock path 1',
      validationErrors: mockValidationErrors,
    },
  },
  {
    status: HttpStatus.BAD_REQUEST,
    data: {
      path: 'Mock path 2',
      validationErrors: mockValidationErrors,
    },
  },
] as AxiosResponse[];

describe('modules/gift/helpers/response-mappings', () => {
  describe('mapErrorResponses', () => {
    it('should return an array of simplified responses', () => {
      const result = mapErrorResponses(mockResponses);

      const expected = [
        {
          path: mockResponses[0].data.path,
          messages: [mockValidationErrors[0].message, mockValidationErrors[1].message],
        },
        {
          path: mockResponses[1].data.path,
          messages: [mockValidationErrors[0].message, mockValidationErrors[1].message],
        },
        {
          path: mockResponses[2].data.path,
          messages: [mockValidationErrors[0].message, mockValidationErrors[1].message],
        },
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('createBadRequestObject', () => {
    it('should return an object with a validationErrors array', () => {
      const result = createBadRequestObject(mockResponses);

      const expected = {
        status: HttpStatus.BAD_REQUEST,
        statusText: 'Bad request',
        validationErrors: mapErrorResponses(mockResponses),
      };

      expect(result).toStrictEqual(expected);
    });
  });

  describe('mapResponsesData', () => {
    it('should return an array of response.data object', () => {
      const result = mapResponsesData(mockResponses);

      const expected = [mockResponses[0].data, mockResponses[1].data, mockResponses[2].data];

      expect(result).toStrictEqual(expected);
    });
  });
});
