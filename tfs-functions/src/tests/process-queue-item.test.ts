const TFS_API_BASE_URL = 'https://mock-tfs-api.com';
process.env.TFS_API_BASE_URL = TFS_API_BASE_URL;

// eslint-disable-next-line import/first
import { processQueueItem } from '../functions/process-queue-item';
// eslint-disable-next-line import/first
import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
// eslint-disable-next-line import/first
import { createHaloTicket } from '../utils/create-halo-ticket';
// eslint-disable-next-line import/first
import { postToGiftApi } from '../utils/post-to-gift-api';

jest.mock('../utils/post-to-gift-api');
jest.mock('../utils/create-halo-ticket');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('processQueueItem Azure function', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when messageType is facility-creation', () => {
    const queueItem = {
      messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION,
      payload: { overview: { facilityId: 'abc-123' } },
    };

    it('logs the received item and calls postToGiftApi with the creation URL, payload, and context', async () => {
      // Arrange
      (postToGiftApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any);

      // Assert
      expect(context.log).toHaveBeenCalledWith('Gift requests queue function received item:', queueItem);
      expect(postToGiftApi).toHaveBeenCalledTimes(1);
      expect(postToGiftApi).toHaveBeenCalledWith(`${TFS_API_BASE_URL}/api/v2/gift/facility`, queueItem.payload, 'Failed to create GIFT facility', context);
      expect(context.log).toHaveBeenCalledWith('Gift facility creation succeeded');
    });

    it('does not call createHaloTicket when postToGiftApi succeeds', async () => {
      // Arrange
      (postToGiftApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToGiftApi throws', () => {
      it('calls createHaloTicket with the facilityId, payload, error message, messageType, and context', async () => {
        // Arrange
        const error = new Error('Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToGiftApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act
        await processQueueItem(queueItem, context as any).catch(() => {});

        // Assert
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith('abc-123', queueItem, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context);
      });

      it('rethrows the original error after calling createHaloTicket', async () => {
        // Arrange
        const error = new Error('Failed to create GIFT facility');

        (postToGiftApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processQueueItem(queueItem, context as any)).rejects.toThrow(error);
      });
    });
  });

  describe('when messageType is facility-amendment', () => {
    const queueItem = {
      messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT,
      facilityId: 'abc-123',
      payload: { amendmentType: 'INCREASE_AMOUNT', data: { amount: 5000, date: '2025-06-01' } },
    };

    it('logs the received item and calls postToGiftApi with the amendment URL, payload, and context', async () => {
      // Arrange
      (postToGiftApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any);

      // Assert
      expect(context.log).toHaveBeenCalledWith('Gift requests queue function received item:', queueItem);
      expect(postToGiftApi).toHaveBeenCalledTimes(1);
      expect(postToGiftApi).toHaveBeenCalledWith(
        `${TFS_API_BASE_URL}/api/v2/gift/facility/abc-123/amendment`,
        queueItem.payload,
        'Failed to amend GIFT facility',
        context,
      );
      expect(context.log).toHaveBeenCalledWith('Gift facility amendment succeeded');
    });

    it('does not call createHaloTicket when postToGiftApi succeeds', async () => {
      // Arrange
      (postToGiftApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToGiftApi throws', () => {
      it('calls createHaloTicket with the facilityId, payload, error message, messageType, and context', async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToGiftApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act
        await processQueueItem(queueItem, context as any).catch(() => {});

        // Assert
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith('abc-123', queueItem, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, context);
      });

      it('rethrows the original error after calling createHaloTicket', async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility');

        (postToGiftApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processQueueItem(queueItem, context as any)).rejects.toThrow(error);
      });
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as the facilityId when facilityId is not present in the creation queue item', async () => {
      // Arrange
      const queueItem = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: {} };
      const error = new Error('Failed to create GIFT facility');

      (postToGiftApi as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith('unknown', queueItem, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context);
    });

    it('uses "Unknown error" as the error message when the thrown value is not an Error', async () => {
      // Arrange
      const queueItem = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: { overview: { facilityId: 'abc-123' } } };

      (postToGiftApi as jest.Mock).mockRejectedValue('unexpected string error');
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith('abc-123', queueItem, 'Unknown error', GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context);
    });
  });
});
