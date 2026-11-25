import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { mapResponseData } from '.';

describe('modules/gift/helpers/map-response-data', () => {
  it('should return response.data object', () => {
    // Arrange
    const mockResponse = {
      status: HttpStatus.BAD_REQUEST,
      data: {
        id: 1,
        eventType: 'Mock event type',
        data: { mockEventData: true },
      },
    } as AxiosResponse;

    // Act
    const result = mapResponseData(mockResponse);

    // Assert
    const expected = mockResponse.data.data;

    expect(result).toStrictEqual(expected);
  });
});
