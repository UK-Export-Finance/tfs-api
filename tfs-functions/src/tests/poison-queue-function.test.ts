import { processPoisonQueueItem } from 'functions/poison-queue-function';

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
    const queueItem = { facilityId: 'abc-123' };

    // Act
    processPoisonQueueItem(queueItem, context as any);

    // Assert
    expect(context.log).toHaveBeenCalledTimes(1);
    expect(context.log).toHaveBeenCalledWith('Gift requests item added to poison queue:', queueItem);
  });
});
