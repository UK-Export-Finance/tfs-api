import { processQueueItem } from 'functions/process-queue-item';
import { createGiftFacility } from 'utils/create-gift-facility';

jest.mock('utils/create-gift-facility');

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

  it('propagates errors thrown by createGiftFacility', async () => {
    // Arrange
    const queueItem = { facilityId: 'abc-123' };
    const error = new Error('Failed to create GIFT facility');

    (createGiftFacility as jest.Mock).mockRejectedValue(error);

    // Act
    const processQueueItemCall = () => processQueueItem(queueItem, context as any);

    // Assert
    await expect(processQueueItemCall()).rejects.toThrow(error);
  });
});
