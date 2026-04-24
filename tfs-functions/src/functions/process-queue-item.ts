import { app, InvocationContext } from '@azure/functions';

import { createGiftFacility } from '../utils/create-gift-facility';

/**
 * Processes an item from the 'gift-requests' Azure Storage Queue.
 * Calls tfs-api which will call GIFT to trigger the creation of a GIFT facility based on the queue item payload.
 * @param queueItem - The raw queue message payload.
 * @param context - The Azure Functions invocation context for logging and metadata.
 */
export async function processQueueItem(queueItem: unknown, context: InvocationContext): Promise<void> {
  context.log('Gift requests queue function received item:', queueItem);
  await createGiftFacility(queueItem, context);
  context.log('Gift facility creation succeeded');
}

app.storageQueue('processQueueItem', {
  queueName: 'gift-requests',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
