import { app, InvocationContext } from '@azure/functions';

import { GiftQueueMessage } from '../types/queue-message.type';
import { extractFacilityId } from '../utils/extract-facility-id';
import { processGiftQueueMessage } from '../utils/process-gift-queue-message';

/**
 * Processes an item from the 'gift-requests' Azure Storage Queue.
 * Routes to either facility creation or amendment based on the messageType flag.
 * On failure, raises a Halo ticket with the error details before rethrowing.
 *
 * @param queueItem - The raw queue message payload.
 * @param context - The Azure Functions invocation context for logging and metadata.
 */
export async function processQueueItem(queueItem: unknown, context: InvocationContext): Promise<void> {
  const facilityId = extractFacilityId(queueItem as GiftQueueMessage);
  context.log('GIFT requests queue function received item, facilityId:', facilityId);
  await processGiftQueueMessage(queueItem, context);
}

app.storageQueue('processQueueItem', {
  queueName: 'gift-requests',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
