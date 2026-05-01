// Set mock environment variables before importing modules that depend on them

const TFS_API_BASE_URL = 'https://mock-tfs-api.com';
const TFS_API_KEY = 'mock-api-key';
process.env.TFS_API_BASE_URL = TFS_API_BASE_URL;
process.env.TFS_API_KEY = TFS_API_KEY;

// eslint-disable-next-line import/first
import axios from 'axios';
// eslint-disable-next-line import/first
import { createGiftFacility } from 'utils/create-gift-facility';

jest.mock('axios');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('createGiftFacility', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('posts the queue item to the facility creation URL with the correct headers', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };

    axios.post = jest.fn().mockResolvedValue({
      status: 201,
      data: {},
    });

    // Act
    await createGiftFacility(queueItem, context as any);

    // Assert
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${TFS_API_BASE_URL}/api/v2/gift/facility`, queueItem, {
      headers: {
        'x-api-key': TFS_API_KEY,
        accept: 'application/json',
      },
    });
  });

  it('does not throw or log an error when the API responds with status 201', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };

    axios.post = jest.fn().mockResolvedValue({
      status: 201,
      data: {},
    });

    // Act
    await createGiftFacility(queueItem, context as any);

    // Assert
    expect(context.error).not.toHaveBeenCalled();
  });

  it('logs an error and throws if the API responds with a non-201 status', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };
    const responseData = { error: 'Bad Request' };

    axios.post = jest.fn().mockResolvedValue({
      status: 400,
      data: responseData,
    });

    // Act
    const createGiftFacilityCall = () => createGiftFacility(queueItem, context as any);

    // Assert
    await expect(createGiftFacilityCall()).rejects.toThrow('Failed to create GIFT facility');
    expect(context.error).toHaveBeenCalledWith('Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}');
  });

  it('logs an error and throws if axios throws an Error', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };

    axios.post = jest.fn().mockRejectedValue(new Error('Network Error'));

    // Act
    const createGiftFacilityCall = () => createGiftFacility(queueItem, context as any);

    // Assert
    await expect(createGiftFacilityCall()).rejects.toThrow('Failed to create GIFT facility, error: Network Error');
    expect(context.error).toHaveBeenCalledWith('Failed to create GIFT facility, error: Network Error');
  });

  it('logs an error and throws if axios throws a non-Error', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };

    axios.post = jest.fn().mockRejectedValue('unexpected string error');

    // Act
    const createGiftFacilityCall = () => createGiftFacility(queueItem, context as any);

    // Assert
    await expect(createGiftFacilityCall()).rejects.toThrow('Failed to create GIFT facility, unknown error');
    expect(context.error).toHaveBeenCalledWith('Failed to create GIFT facility, unknown error');
  });
});
