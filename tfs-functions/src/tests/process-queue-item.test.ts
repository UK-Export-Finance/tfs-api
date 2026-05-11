import { processQueueItem } from '../functions/process-queue-item';
import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { processGiftQueueMessage } from '../utils/process-gift-queue-message';

jest.mock('../utils/process-gift-queue-message');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('processQueueItem Azure function', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('logs the received item and delegates to processGiftQueueMessage', async () => {
    // Arrange
    const queueItem = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: {} };
    (processGiftQueueMessage as jest.Mock).mockResolvedValue(undefined);

    // Act
    await processQueueItem(queueItem, context as any);

    // Assert
    expect(context.log).toHaveBeenCalledWith('Gift requests queue function received item:', queueItem);
    expect(processGiftQueueMessage).toHaveBeenCalledWith(queueItem, context);
  });
});
