import { processPoisonQueueItem } from '../functions/poison-queue-function';
import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('processPoisonQueueItem Azure function', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('logs the item added to the poison queue', () => {
    // Arrange
    const queueItem = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, facilityId: '0011111111', payload: {} };

    // Act
    processPoisonQueueItem(queueItem, context as any);

    // Assert
    expect(context.log).not.toHaveBeenCalled();
    expect(context.error).toHaveBeenCalledTimes(1);
    expect(context.error).toHaveBeenCalledWith('GIFT requests item added to poison queue, facilityId:', '0011111111');
  });
});
