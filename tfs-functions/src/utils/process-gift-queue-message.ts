import { InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';
import { createHaloTicket } from './create-halo-ticket';
import { requireEnv } from './env';
import { postToTfsApi } from './post-to-tfs-api';
import { trackEvent, trackException } from './telemetry';

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
  const dequeueCount = String(context.triggerMetadata.dequeueCount ?? 1);
  const facilityId = (() => {
    try {
      return extractFacilityId(item);
    } catch {
      return 'unknown';
    }
  })();

  try {
    switch (messageType) {
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
        await postToTfsApi(GIFT_API_URL.facilityCreation, item.payload, 'Failed to create GIFT facility', context);
        context.log('Gift facility creation succeeded');
        trackEvent('gift.queue.message.processed', {
          messageType,
          operation: 'facility-creation',
          dequeueCount,
          facilityId,
          status: 'success',
        });
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
        await postToTfsApi(GIFT_API_URL.facilityAmendment(item.facilityId as string), item.payload, 'Failed to amend GIFT facility', context);
        context.log('Gift facility amendment succeeded');
        trackEvent('gift.queue.message.processed', {
          messageType,
          operation: 'facility-amendment',
          dequeueCount,
          facilityId,
          status: 'success',
        });
        break;
      default:
        throwIfNotExhaustive(messageType);
    }
  } catch (error) {
    trackException(error, {
      messageType,
      dequeueCount,
      facilityId,
      status: 'error',
    });

    if (context.triggerMetadata.dequeueCount === 5) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await createHaloTicket(facilityId, queueItem, errorMessage, messageType, context);
      trackEvent('gift.queue.halo-ticket.created', {
        messageType,
        dequeueCount,
        facilityId,
        status: 'created',
      });
    }
    throw error;
  }
}
