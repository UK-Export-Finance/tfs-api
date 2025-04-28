import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { mapResponsesData } from '.';

describe('modules/gift/helpers/map-responses-data', () => {
  it('should return an array of response.data object', () => {
    // Arrange
    const mockResponses = [
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          id: 1,
          eventType: 'Mock event type',
          eventData: { mockEventData: true },
        },
      },
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          id: 2,
          eventType: 'Mock event type',
          eventData: { mockEventData: true },
        },
      },
      {
        status: HttpStatus.BAD_REQUEST,
        data: {
          id: 3,
          eventType: 'Mock event type',
          eventData: { mockEventData: true },
        },
      },
    ] as AxiosResponse[];

    // Act
    const result = mapResponsesData(mockResponses);

    // Assert
    const expected = [mockResponses[0].data.eventData, mockResponses[1].data.eventData, mockResponses[2].data.eventData];

    expect(result).toStrictEqual(expected);
  });
});
