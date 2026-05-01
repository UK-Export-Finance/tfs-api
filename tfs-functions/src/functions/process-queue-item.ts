import { app, InvocationContext } from '@azure/functions';

import { createGiftFacility } from '../utils/create-gift-facility';
import { createHaloTicket } from '../utils/create-halo-ticket';

function extractFacilityId(queueItem: unknown): string {
  return (queueItem as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'unknown';
}

/**
 * Processes an item from the 'gift-requests' Azure Storage Queue.
 * Calls tfs-api which will call GIFT to trigger the creation of a GIFT facility based on the queue item payload.
 * On failure, raises a Halo ticket with the error details before rethrowing.
 * @param queueItem - The raw queue message payload.
 * @param context - The Azure Functions invocation context for logging and metadata.
 */
export async function processQueueItem(queueItem: unknown, context: InvocationContext): Promise<void> {
  context.log('Gift requests queue function received item:', queueItem);

  try {
    await createGiftFacility(queueItem, context);
  } catch (error) {
    const facilityId = extractFacilityId(queueItem);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await createHaloTicket(facilityId, queueItem, errorMessage, context);
    throw error;
  }

  context.log('Gift facility creation succeeded');
}

app.storageQueue('processQueueItem', {
  queueName: 'gift-requests',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
