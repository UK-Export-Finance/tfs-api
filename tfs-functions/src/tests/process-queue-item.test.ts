import { processQueueItem } from 'functions/process-queue-item';
import { createGiftFacility } from 'utils/create-gift-facility';
import { createHaloTicket } from 'utils/create-halo-ticket';

jest.mock('utils/create-gift-facility');
jest.mock('utils/create-halo-ticket');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('processQueueItem Azure function', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('logs the received item and calls createGiftFacility with the queue item and context', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };

    (createGiftFacility as jest.Mock).mockResolvedValue(undefined);

    // Act
    await processQueueItem(queueItem, context as any);

    // Assert
    expect(context.log).toHaveBeenCalledWith('Gift requests queue function received item:', queueItem);
    expect(createGiftFacility).toHaveBeenCalledTimes(1);
    expect(createGiftFacility).toHaveBeenCalledWith(queueItem, context);
    expect(context.log).toHaveBeenCalledWith('Gift facility creation succeeded');
  });

  it('does not call createHaloTicket when createGiftFacility succeeds', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };

    (createGiftFacility as jest.Mock).mockResolvedValue(undefined);

    // Act
    await processQueueItem(queueItem, context as any);

    // Assert
    expect(createHaloTicket).not.toHaveBeenCalled();
  });

  describe('when createGiftFacility throws', () => {
    it('calls createHaloTicket with the facilityId, payload, error message, and context', async () => {
      // Arrange
      const queueItem = {
        overview: {
          facilityId: 'abc-123',
        },
      };
      
      const error = new Error('Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}');

      (createGiftFacility as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledTimes(1);
      expect(createHaloTicket).toHaveBeenCalledWith('abc-123', queueItem, error.message, context);
    });

    it('uses "unknown" as the facilityId when facilityId is not present in the queue item', async () => {
      // Arrange
      const queueItem = { someOtherField: 'value' };
      const error = new Error('Failed to create GIFT facility');

      (createGiftFacility as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith('unknown', queueItem, error.message, context);
    });

    it('uses "unknown" as the facilityId when the queue item is not an object', async () => {
      // Arrange
      const queueItem = 'not-an-object';
      const error = new Error('Failed to create GIFT facility');

      (createGiftFacility as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith('unknown', queueItem, error.message, context);
    });

    it('uses "Unknown error" as the error message when the thrown value is not an Error', async () => {
      // Arrange
      const queueItem = {
        overview: {
          facilityId: 'abc-123',
        },
      };

      (createGiftFacility as jest.Mock).mockRejectedValue('unexpected string error');
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      await processQueueItem(queueItem, context as any).catch(() => {});

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith('abc-123', queueItem, 'Unknown error', context);
    });

    it('rethrows the original error after calling createHaloTicket', async () => {
      // Arrange
      const queueItem = { facilityId: 'abc-123' };
      const error = new Error('Failed to create GIFT facility');

      (createGiftFacility as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      const processQueueItemCall = () => processQueueItem(queueItem, context as any);

      // Assert
      await expect(processQueueItemCall()).rejects.toThrow(error);
    });

    it('rethrows the original error even if createHaloTicket also throws', async () => {
      // Arrange
      const queueItem = { facilityId: 'abc-123' };
      const originalError = new Error('Failed to create GIFT facility');
      const haloError = new Error('Failed to create Halo ticket: Internal Server Error');

      (createGiftFacility as jest.Mock).mockRejectedValue(originalError);
      (createHaloTicket as jest.Mock).mockRejectedValue(haloError);

      // Act
      const processQueueItemCall = () => processQueueItem(queueItem, context as any);

      // Assert
      await expect(processQueueItemCall()).rejects.toThrow(haloError);
    });
  });
});
