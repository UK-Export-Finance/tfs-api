import { app, InvocationContext } from '@azure/functions';

import { GiftQueueMessage } from '../types/queue-message.type';
import { extractFacilityId } from '../utils/extract-facility-id';

export function processPoisonQueueItem(queueItem: unknown, context: InvocationContext): void {
  const facilityId = extractFacilityId(queueItem as GiftQueueMessage);
  context.error('GIFT requests item added to poison queue, facilityId:', facilityId);
}

app.storageQueue('processPoisonQueueItem', {
  queueName: 'gift-requests-poison',
  connection: 'AzureWebJobsStorage',
  handler: processPoisonQueueItem,
});
