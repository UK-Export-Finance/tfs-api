import { app, InvocationContext } from '@azure/functions';

import { extractFacilityIds } from '../utils/extract-facility-id';

export function processPoisonQueueItem(queueItem: unknown, context: InvocationContext): void {
  const facilityId = extractFacilityIds(queueItem);
  context.error('GIFT requests item added to poison queue, facilityId:', facilityId);
}

app.storageQueue('processPoisonQueueItem', {
  queueName: 'gift-requests-poison',
  connection: 'AzureWebJobsStorage',
  handler: processPoisonQueueItem,
});
