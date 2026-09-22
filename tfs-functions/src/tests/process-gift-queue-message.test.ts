import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { postToTfsApi } from '../utils/post-to-tfs-api';
import { processGiftQueueMessage } from '../utils/process-gift-queue-message';

const { FACILITY_CREATION, FACILITY_AMENDMENT, FACILITY_MULTIPLE_AMENDMENTS } = GIFT_QUEUE_MESSAGE_TYPE;

const apimTfsUrl = process.env.APIM_TFS_URL;
const GIFT_MAX_NUMBER_OF_RETRIES = Number(process.env.GIFT_MAX_NUMBER_OF_RETRIES);
const mockFacilityId = '00111111111';

jest.mock('../utils/post-to-tfs-api');
jest.mock('../utils/create-halo-ticket');

const context = {
  log: jest.fn(),
  error: jest.fn(),
  triggerMetadata: {
    dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES,
  },
};

describe('processGiftQueueMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe(`when messageType is ${FACILITY_CREATION}`, () => {
    const queueItem = {
      messageType: FACILITY_CREATION,
      payload: {
        overview: {
          facilityId: mockFacilityId,
        },
      },
    };

    it('should call postToTfsApi with the creation URL, payload, and context', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(postToTfsApi).toHaveBeenCalledTimes(1);
      expect(postToTfsApi).toHaveBeenCalledWith(
        `${apimTfsUrl}/api/v2/gift/facility/without-queue`,
        queueItem.payload,
        `Failed to create GIFT facility ${mockFacilityId}`,
        context,
      );
      expect(context.log).toHaveBeenCalledWith('GIFT facility creation succeeded for facilityId: ', mockFacilityId);
    });

    it('should not call createHaloTicket when postToTfsApi succeeds', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToTfsApi throws', () => {
      it(`calls createHaloTicket and rethrows when dequeueCount is ${GIFT_MAX_NUMBER_OF_RETRIES}`, async () => {
        // Arrange
        const error = new Error('Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToTfsApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, context as any)).rejects.toThrow(error);
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith(mockFacilityId, queueItem, error.message, FACILITY_CREATION, context);
      });

      it(`should not call createHaloTicket and rethrows when dequeueCount is less than ${GIFT_MAX_NUMBER_OF_RETRIES}`, async () => {
        // Arrange
        const error = new Error('Failed to create GIFT facility');
        const contextWithLowDequeueCount = {
          ...context,
          triggerMetadata: {
            dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES - 1,
          },
        };

        (postToTfsApi as jest.Mock).mockRejectedValue(error);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, contextWithLowDequeueCount as any)).rejects.toThrow(error);
        expect(createHaloTicket).not.toHaveBeenCalled();
      });
    });
  });

  describe(`when messageType is ${FACILITY_AMENDMENT}`, () => {
    const queueItem = {
      messageType: FACILITY_AMENDMENT,
      facilityId: mockFacilityId,
      payload: {
        amendmentType: 'INCREASE_AMOUNT',
        amendmentData: {
          amount: 5000,
          date: '2025-06-01',
        },
      },
    };

    it('should call postToTfsApi with the amendment URL, payload, and context', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(postToTfsApi).toHaveBeenCalledTimes(1);
      expect(postToTfsApi).toHaveBeenCalledWith(
        `${apimTfsUrl}/api/v2/gift/facility/${mockFacilityId}/amendment/without-queue`,
        queueItem.payload,
        `Failed to amend GIFT facility ${mockFacilityId}`,
        context,
      );
      expect(context.log).toHaveBeenCalledWith('GIFT facility amendment succeeded for facilityId: ', mockFacilityId);
    });

    it('should not call createHaloTicket when postToTfsApi succeeds', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToTfsApi throws', () => {
      it(`calls createHaloTicket and rethrows when dequeueCount is ${GIFT_MAX_NUMBER_OF_RETRIES}`, async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToTfsApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, context as any)).rejects.toThrow(error);
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith(mockFacilityId, queueItem, error.message, FACILITY_AMENDMENT, context);
      });

      it(`should not call createHaloTicket and rethrows when dequeueCount is less than ${GIFT_MAX_NUMBER_OF_RETRIES}`, async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility');
        const contextWithLowDequeueCount = {
          ...context,
          triggerMetadata: {
            dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES - 1,
          },
        };

        (postToTfsApi as jest.Mock).mockRejectedValue(error);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, contextWithLowDequeueCount as any)).rejects.toThrow(error);
        expect(createHaloTicket).not.toHaveBeenCalled();
      });
    });
  });

  describe(`when messageType is ${FACILITY_MULTIPLE_AMENDMENTS}`, () => {
    const queueItem = {
      messageType: FACILITY_MULTIPLE_AMENDMENTS,
      facilityId: mockFacilityId,
      payload: {
        amendments: [
          {
            amendmentType: 'IncreaseAmount',
            amendmentData: {
              amount: 5000,
              date: '2025-06-01',
            },
          },
          {
            amendmentType: 'ReplaceExpiryDate',
            amendmentData: {
              expiryDate: '2025-06-01',
            },
          },
        ],
      },
    };

    it('should call postToTfsApi with the amendment URL, payload, and context', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(postToTfsApi).toHaveBeenCalledTimes(1);
      expect(postToTfsApi).toHaveBeenCalledWith(
        `${apimTfsUrl}/api/v2/gift/facility/${mockFacilityId}/multiple-amendments/without-queue`,
        queueItem.payload,
        `Failed to amend GIFT facility ${mockFacilityId}`,
        context,
      );
      expect(context.log).toHaveBeenCalledWith('GIFT facility amendment (multiple amendments) succeeded for facilityId: ', mockFacilityId);
    });

    it('should not call createHaloTicket when postToTfsApi succeeds', async () => {
      // Arrange
      (postToTfsApi as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any);

      // Assert
      expect(createHaloTicket).not.toHaveBeenCalled();
    });

    describe('when postToTfsApi throws', () => {
      it(`calls createHaloTicket and rethrows when dequeueCount is ${GIFT_MAX_NUMBER_OF_RETRIES}`, async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility, status: 400, response: {"error":"Bad Request"}');

        (postToTfsApi as jest.Mock).mockRejectedValue(error);
        (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, context as any)).rejects.toThrow(error);
        expect(createHaloTicket).toHaveBeenCalledTimes(1);
        expect(createHaloTicket).toHaveBeenCalledWith(mockFacilityId, queueItem, error.message, FACILITY_AMENDMENT, context);
      });

      it(`should not call createHaloTicket and rethrows when dequeueCount is less than ${GIFT_MAX_NUMBER_OF_RETRIES}`, async () => {
        // Arrange
        const error = new Error('Failed to amend GIFT facility');
        const contextWithLowDequeueCount = {
          ...context,
          triggerMetadata: {
            dequeueCount: GIFT_MAX_NUMBER_OF_RETRIES - 1,
          },
        };

        (postToTfsApi as jest.Mock).mockRejectedValue(error);

        // Act & Assert
        await expect(processGiftQueueMessage(queueItem, contextWithLowDequeueCount as any)).rejects.toThrow(error);
        expect(createHaloTicket).not.toHaveBeenCalled();
      });
    });
  });

  describe('when messageType is not supported', () => {
    const queueItem = {
      messageType: 'Not supported',
    };

    it('should throw an error indicating the message type is unhandled', async () => {
      // Act & Assert
      const expected = 'APIM TFS - Unhandled message type: Not supported';

      await expect(processGiftQueueMessage(queueItem, context as any)).rejects.toThrow(expected);
    });
  });

  describe('edge cases', () => {
    it('uses "Unknown error" as the error message when the thrown value is not an Error', async () => {
      // Arrange
      const queueItem = {
        messageType: FACILITY_CREATION,
        payload: {
          overview: {
            facilityId: mockFacilityId,
          },
        },
      };

      (postToTfsApi as jest.Mock).mockRejectedValue('unexpected string error');
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processGiftQueueMessage(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith(mockFacilityId, queueItem, 'Unknown error', FACILITY_CREATION, context);
    });
  });
});
