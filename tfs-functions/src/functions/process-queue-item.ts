import { app, InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { postToTfsApi } from '../utils/post-to-tfs-api';

const { TFS_API_BASE_URL: baseUrl } = process.env;

const GIFT_API_URL = {
  facilityCreation: `${baseUrl}/api/v2/gift/facility`,
  facilityAmendment: (facilityId: string) => `${baseUrl}/api/v2/gift/facility/${facilityId}/amendment`,
} as const;

const assertNever = (value: never): never => {
  throw new Error(`Unhandled message type: ${value}`);
};

const extractFacilityId = (item: GiftQueueMessage): string => {
  switch (item.messageType) {
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
      return item.facilityId ?? 'unknown';
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
      return (item.payload as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'unknown';
    default:
      return assertNever(item.messageType);
  }
};

/**
 * Processes an item from the 'gift-requests' Azure Storage Queue.
 * Routes to either facility creation or amendment based on the messageType flag.
 * On failure, raises a Halo ticket with the error details before rethrowing.
 * @param queueItem - The raw queue message payload.
 * @param context - The Azure Functions invocation context for logging and metadata.
 */
export async function processQueueItem(queueItem: unknown, context: InvocationContext): Promise<void> {
  context.log('Gift requests queue function received item:', queueItem);

  const item = queueItem as GiftQueueMessage;
  const { messageType } = item;

  try {
    switch (messageType) {
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
        await postToTfsApi(GIFT_API_URL.facilityCreation, item.payload, 'Failed to create GIFT facility', context);
        context.log('Gift facility creation succeeded');
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
        await postToTfsApi(GIFT_API_URL.facilityAmendment(item.facilityId as string), item.payload, 'Failed to amend GIFT facility', context);
        context.log('Gift facility amendment succeeded');
        break;
      default:
        assertNever(messageType);
    }
  } catch (error) {
    const facilityId = extractFacilityId(item);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await createHaloTicket(facilityId, queueItem, errorMessage, messageType, context);
    throw error;
  }
}

app.storageQueue('processQueueItem', {
  queueName: 'gift-requests',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
