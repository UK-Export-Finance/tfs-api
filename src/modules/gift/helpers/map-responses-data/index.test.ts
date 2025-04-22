import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { mapResponsesData } from '.';

describe('modules/gift/helpers/map-responses-data', () => {
  it('should return an array of response.data object', () => {
    // Arrange
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

    // Act
    const result = mapResponsesData(mockResponses);

    // Assert
    const expected = [mockResponses[0].data, mockResponses[1].data, mockResponses[2].data];

    expect(result).toStrictEqual(expected);
  });
});
