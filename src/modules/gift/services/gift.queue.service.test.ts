import { QueueServiceClient } from '@azure/storage-queue';
import { ConfigService } from '@nestjs/config';
import { GiftQueueConfig, KEY as GIFT_QUEUE_CONFIG_KEY } from '@ukef/config/gift-queue.config';
import { PinoLogger } from 'nestjs-pino';

import { GiftQueueService } from './gift.queue.service';

jest.mock('@azure/storage-queue');

const mockConnectionString = 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=abc123;EndpointSuffix=core.windows.net';
const mockQueueName = 'gift-requests';

const mockQueueConfig: GiftQueueConfig = {
  connectionString: mockConnectionString,
  queueName: mockQueueName,
};

const mockPayload = { facilityId: '0030000321', dealId: '0020000123' };
const expectedMessage = Buffer.from(JSON.stringify(mockPayload)).toString('base64');

describe('GiftQueueService', () => {
  const logger = new PinoLogger({});

  let service: GiftQueueService;
  let configService: ConfigService;
  let mockSendMessage: jest.Mock;
  let mockGetQueueClient: jest.Mock;
  let mockFromConnectionString: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockSendMessage = jest.fn().mockResolvedValueOnce(undefined);
    mockGetQueueClient = jest.fn().mockReturnValue({ sendMessage: mockSendMessage });
    mockFromConnectionString = jest.fn().mockReturnValue({ getQueueClient: mockGetQueueClient });

    (QueueServiceClient.fromConnectionString as jest.Mock) = mockFromConnectionString;

    configService = {
      get: jest.fn().mockReturnValue(mockQueueConfig),
    } as unknown as ConfigService;

    service = new GiftQueueService(logger, configService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should call configService.get with the gift queue config key', () => {
      // Assert
      expect(configService.get).toHaveBeenCalledWith(GIFT_QUEUE_CONFIG_KEY);
    });

    it('should call QueueServiceClient.fromConnectionString with the connection string', () => {
      // Assert
      expect(mockFromConnectionString).toHaveBeenCalledTimes(1);
      expect(mockFromConnectionString).toHaveBeenCalledWith(mockConnectionString);
    });

    it('should call getQueueClient with the queue name', () => {
      // Assert
      expect(mockGetQueueClient).toHaveBeenCalledTimes(1);
      expect(mockGetQueueClient).toHaveBeenCalledWith(mockQueueName);
    });
  });

  describe('enqueue', () => {
    it('should call queueClient.sendMessage with a base64-encoded JSON payload', async () => {
      // Act
      await service.enqueue(mockPayload);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith(expectedMessage);
    });

    describe('when queueClient.sendMessage is successful', () => {
      it('should resolve without returning a value', async () => {
        // Act
        const result = await service.enqueue(mockPayload);

        // Assert
        expect(result).toBeUndefined();
      });
    });

    describe('when queueClient.sendMessage throws an error', () => {
      const mockError = new Error('Queue send failed');

      beforeEach(() => {
        // Arrange
        mockSendMessage = jest.fn().mockRejectedValueOnce(mockError);
        mockGetQueueClient = jest.fn().mockReturnValue({ sendMessage: mockSendMessage });
        mockFromConnectionString = jest.fn().mockReturnValue({ getQueueClient: mockGetQueueClient });

        (QueueServiceClient.fromConnectionString as jest.Mock) = mockFromConnectionString;

        service = new GiftQueueService(logger, configService);
      });

      it('should throw the error', async () => {
        // Act
        const promise = service.enqueue(mockPayload);

        // Assert
        await expect(promise).rejects.toThrow(mockError);
      });
    });
  });
});
