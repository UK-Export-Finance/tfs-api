import { DefaultAzureCredential } from '@azure/identity';
import { QueueServiceClient } from '@azure/storage-queue';
import { ConfigService } from '@nestjs/config';
import { GiftQueueConfig, KEY as GIFT_QUEUE_CONFIG_KEY } from '@ukef/config/gift-queue.config';
import { GIFT } from '@ukef/constants';
import { PinoLogger } from 'nestjs-pino';

import { GiftQueueService } from './gift.queue.service';

jest.mock('@azure/identity');
jest.mock('@azure/storage-queue');

const mockConnectionString = 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=abc123;EndpointSuffix=core.windows.net';
const mockStorageAccountName = 'mystorageaccount';
const mockQueueName = 'gift-requests';
const mockClientId = 'mock-client-id';
const { QUEUE_DELAY } = GIFT;

const mockQueueConfig: GiftQueueConfig = {
  storageAccountName: undefined,
  connectionString: mockConnectionString,
  clientId: undefined,
  queueName: mockQueueName,
};

const mockCreationMessage = {
  messageType: 'FACILITY_CREATION' as const,
  payload: {
    overview: { facilityId: '0030000321' },
  },
};

const mockAmendmentMessage = {
  messageType: 'FACILITY_AMENDMENT' as const,
  facilityId: '0030000321',
  payload: {
    amendmentType: 'INCREASE_AMOUNT',
    amendmentData: { amount: 100, date: '2026-01-01' },
  },
};

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
    describe('when connectionString is provided', () => {
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

    describe('when storageAccountName is provided and connectionString is not', () => {
      let mockQueueServiceClientConstructor: jest.Mock;

      beforeEach(() => {
        // Arrange
        mockGetQueueClient = jest.fn().mockReturnValue({ sendMessage: mockSendMessage });
        mockQueueServiceClientConstructor = jest.fn().mockReturnValue({ getQueueClient: mockGetQueueClient });
        (QueueServiceClient as unknown as jest.Mock).mockImplementation(mockQueueServiceClientConstructor);

        const managedIdentityConfig: GiftQueueConfig = {
          storageAccountName: mockStorageAccountName,
          connectionString: undefined,
          clientId: mockClientId,
          queueName: mockQueueName,
        };

        configService = {
          get: jest.fn().mockReturnValue(managedIdentityConfig),
        } as unknown as ConfigService;

        service = new GiftQueueService(logger, configService);
      });

      it('should call QueueServiceClient with the storage account queue URL and a DefaultAzureCredential', () => {
        // Assert
        expect(DefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId: mockClientId });
        expect(QueueServiceClient).toHaveBeenCalledWith(`https://${mockStorageAccountName}.queue.core.windows.net`, expect.any(DefaultAzureCredential));
      });

      it('should call getQueueClient with the queue name', () => {
        // Assert
        expect(mockGetQueueClient).toHaveBeenCalledTimes(1);
        expect(mockGetQueueClient).toHaveBeenCalledWith(mockQueueName);
      });
    });

    describe('when neither connectionString nor storageAccountName is provided', () => {
      it('should throw an error', () => {
        // Arrange
        const invalidConfig: GiftQueueConfig = {
          storageAccountName: undefined,
          connectionString: undefined,
          clientId: undefined,
          queueName: mockQueueName,
        };

        configService = {
          get: jest.fn().mockReturnValue(invalidConfig),
        } as unknown as ConfigService;

        // Act + Assert
        expect(() => new GiftQueueService(logger, configService)).toThrow(
          'Either GIFT_QUEUE_STORAGE_CONNECTION_STRING or GIFT_QUEUE_STORAGE_ACCOUNT_NAME must be set',
        );
      });
    });
  });

  describe('enqueue', () => {
    it('should call queueClient.sendMessage with a base64-encoded JSON payload', async () => {
      const expectedMessage = Buffer.from(JSON.stringify(mockCreationMessage)).toString('base64');

      // Act
      await service.enqueue(mockCreationMessage as any);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith(expectedMessage, {});
    });

    describe('when message is FACILITY_CREATION and payload.delayCreation is true', () => {
      it('should set visibilityTimeout', async () => {
        const delayedCreationMessage = {
          ...mockCreationMessage,
          payload: {
            ...mockCreationMessage.payload,
            delayCreation: true,
          },
        };
        const expectedMessage = Buffer.from(JSON.stringify(delayedCreationMessage)).toString('base64');

        // Act
        await service.enqueue(delayedCreationMessage as any);

        // Assert
        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        expect(mockSendMessage).toHaveBeenCalledWith(expectedMessage, { visibilityTimeout: QUEUE_DELAY });
      });
    });

    describe('when message is FACILITY_CREATION and payload.delayCreation is false', () => {
      it('should not set visibilityTimeout', async () => {
        const nonDelayedCreationMessage = {
          ...mockCreationMessage,
          payload: {
            ...mockCreationMessage.payload,
            delayCreation: false,
          },
        };
        const expectedMessage = Buffer.from(JSON.stringify(nonDelayedCreationMessage)).toString('base64');

        // Act
        await service.enqueue(nonDelayedCreationMessage as any);

        // Assert
        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        expect(mockSendMessage).toHaveBeenCalledWith(expectedMessage, {});
      });
    });

    describe('when message is FACILITY_AMENDMENT', () => {
      it('should not set visibilityTimeout when message is FACILITY_AMENDMENT', async () => {
        const expectedMessage = Buffer.from(JSON.stringify(mockAmendmentMessage)).toString('base64');

        // Act
        await service.enqueue(mockAmendmentMessage as any);

        // Assert
        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        expect(mockSendMessage).toHaveBeenCalledWith(expectedMessage, {});
      });
    });

    describe('when queueClient.sendMessage is successful', () => {
      it('should resolve without returning a value', async () => {
        // Act
        const result = await service.enqueue(mockCreationMessage as any);

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
        const promise = service.enqueue(mockCreationMessage as any);

        // Assert
        await expect(promise).rejects.toThrow(mockError);
      });
    });
  });
});
