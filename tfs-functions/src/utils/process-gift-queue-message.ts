import { InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';
import { createHaloTicket } from './create-halo-ticket';
import { requireEnv } from './env';
import { postToTfsApi } from './post-to-tfs-api';

const baseUrl = requireEnv('TFS_API_BASE_URL');

const GIFT_API_URL = {
  facilityCreation: `${baseUrl}/api/v2/gift/facility`,
  facilityAmendment: (facilityId: string) => `${baseUrl}/api/v2/gift/facility/${facilityId}/amendment`,
} as const;

const throwIfNotExhaustive = (value: never): never => {
  throw new Error(`Unhandled message type: ${value}`);
};

const extractFacilityId = (item: GiftQueueMessage): string => {
  switch (item.messageType) {
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
      return item.facilityId ?? 'unknown';
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
      return (item.payload as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'unknown';
    default:
      return throwIfNotExhaustive(item.messageType);
  }
};

/**
 * Routes and processes a GIFT queue message, calling the appropriate TFS API endpoint.
 * On failure, raises a Halo ticket with the error details before rethrowing.
 *
 * @param queueItem - The raw queue message payload.
 * @param context - The Azure Functions invocation context for logging.
 */
export async function processGiftQueueMessage(queueItem: unknown, context: InvocationContext): Promise<void> {
  const item = queueItem as GiftQueueMessage;
  const { messageType } = item;

  try {
    switch (messageType) {
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
        await postToTfsApi(GIFT_API_URL.facilityCreation, item.payload, 'Failed to create GIFT facility', context);
        context.log('Gift facility creation succeeded');
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
        await postToTfsApi(GIFT_API_URL.facilityAmendment(item.facilityId), item.payload, 'Failed to amend GIFT facility', context);
        context.log('Gift facility amendment succeeded');
        break;
      default:
        throwIfNotExhaustive(messageType);
    }
  } catch (error) {
    if (context.triggerMetadata.dequeueCount === 5) {
      const facilityId = extractFacilityId(item);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await createHaloTicket(facilityId, queueItem, errorMessage, messageType, context);
    }
    throw error;
  }
}
