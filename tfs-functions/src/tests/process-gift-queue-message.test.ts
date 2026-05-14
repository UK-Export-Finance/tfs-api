import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { postToTfsApi } from '../utils/post-to-tfs-api';
import { processGiftQueueMessage } from '../utils/process-gift-queue-message';

const apimTfsUrl = process.env.APIM_TFS_URL;
const GIFT_MAX_NUMBER_OF_RETRIES = Number(process.env.GIFT_MAX_NUMBER_OF_RETRIES);
const TEST_FACILITY_ID = '00111111111';

jest.mock('../utils/post-to-tfs-api');
jest.mock('../utils/create-halo-ticket');

const context = {
  log: jest.fn(),
  error: jest.fn(),
  triggerMetadata: { dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES },
};

describe('processGiftQueueMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when messageType is facility-creation', () => {
    const queueItem = {
      messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION,
      payload: { overview: { facilityId: TEST_FACILITY_ID } },
    };

    it('calls postToTfsApi with the creation URL, payload, and context', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(postToTfsApi).toHaveBeenCalledTimes(1);
      expect(postToTfsApi).toHaveBeenCalledWith(
        `${apimTfsUrl}/api/v2/gift/facility`,
        queueItem.payload,
        `Failed to create GIFT facility ${TEST_FACILITY_ID}`,
        context,
      );
      expect(context.log).toHaveBeenCalledWith('Gift facility creation succeeded');
    });

    it('does not call createHaloTicket when postToTfsApi succeeds', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToTfsApi throws', () => {
      it('calls createHaloTicket and rethrows when dequeueCount is GIFT_MAX_NUMBER_OF_RETRIES', async () => {
        // Arrange
        const error = new Error('Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToTfsApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, context as any)).rejects.toThrow(error);
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith(TEST_FACILITY_ID, queueItem, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context);
      });

      it('does not call createHaloTicket and rethrows when dequeueCount is less than GIFT_MAX_NUMBER_OF_RETRIES', async () => {
        // Arrange
        const error = new Error('Failed to create GIFT facility');
        const contextWithLowDequeueCount = { ...context, triggerMetadata: { dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES - 1 } };

        (postToTfsApi as jest.Mock).mockRejectedValue(error);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, contextWithLowDequeueCount as any)).rejects.toThrow(error);
        expect(createHaloTicket).not.toHaveBeenCalled();
      });
    });
  });

  describe('when messageType is facility-amendment', () => {
    const queueItem = {
      messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT,
      facilityId: TEST_FACILITY_ID,
      payload: { amendmentType: 'INCREASE_AMOUNT', data: { amount: 5000, date: '2025-06-01' } },
    };

    it('calls postToTfsApi with the amendment URL, payload, and context', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(postToTfsApi).toHaveBeenCalledTimes(1);
      expect(postToTfsApi).toHaveBeenCalledWith(
        `${apimTfsUrl}/api/v2/gift/facility/${TEST_FACILITY_ID}/amendment`,
        queueItem.payload,
        `Failed to amend GIFT facility ${TEST_FACILITY_ID}`,
        context,
      );
      expect(context.log).toHaveBeenCalledWith('Gift facility amendment succeeded');
    });

    it('does not call createHaloTicket when postToTfsApi succeeds', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToTfsApi throws', () => {
      it('calls createHaloTicket and rethrows when dequeueCount is GIFT_MAX_NUMBER_OF_RETRIES', async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToTfsApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, context as any)).rejects.toThrow(error);
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith(TEST_FACILITY_ID, queueItem, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, context);
      });

      it('does not call createHaloTicket and rethrows when dequeueCount is less than GIFT_MAX_NUMBER_OF_RETRIES', async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility');
        const contextWithLowDequeueCount = { ...context, triggerMetadata: { dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES - 1 } };

        (postToTfsApi as jest.Mock).mockRejectedValue(error);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, contextWithLowDequeueCount as any)).rejects.toThrow(error);
        expect(createHaloTicket).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as the facilityId when facilityId is not present in the creation queue item', async () => {
      // Arrange
      const queueItem = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: {} };
      const error = new Error(`Failed to create GIFT facility ${TEST_FACILITY_ID}`);

      (postToTfsApi as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith('UNKNOWN_FACILITY_ID', queueItem, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context);
    });

    it('uses "Unknown error" as the error message when the thrown value is not an Error', async () => {
      // Arrange
      const queueItem = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: { overview: { facilityId: TEST_FACILITY_ID } } };

      (postToTfsApi as jest.Mock).mockRejectedValue('unexpected string error');
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith(TEST_FACILITY_ID, queueItem, 'Unknown error', GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context);
    });
  });
});
