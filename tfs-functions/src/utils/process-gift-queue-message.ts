import { InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';
import { createHaloTicket } from './create-halo-ticket';
import { requireEnv, requireEnvInt } from './env';
import { postToTfsApi } from './post-to-tfs-api';

const baseUrl = requireEnv('TFS_API_BASE_URL');
const maxNumberOfRetries = requireEnvInt('GIFT_MAX_NUMBER_OF_RETRIES');

const GIFT_API_URL = {
  facilityCreation: `${baseUrl}/api/v2/gift/facility`,
  facilityAmendment: (facilityId: string) => `${baseUrl}/api/v2/gift/facility/${facilityId}/amendment`,
} as const;

/**
 * Exhaustiveness check for switch statements over discriminated unions.
 * TypeScript will error at compile time if any union member is unhandled.
 * Throws at runtime if an unexpected value reaches the default branch.
 *
 * @param value - The unhandled value (typed `never` to enforce exhaustiveness).
 * @throws {Error} Always — with a message containing the unhandled value.
 */
const throwIfNotExhaustive = (value: never): never => {
  throw new Error(`Unhandled message type: ${value}`);
};

/**
 * Extracts the facility ID from a queue message for use in Halo ticket reporting.
 * For amendments, reads facilityId directly from the message.
 * For creations, reads it from the nested payload overview.
 *
 * @param item - The parsed GIFT queue message.
 * @returns The facility ID string, or `'UNKNOWN_FACILITY_ID'` if it cannot be determined.
 */
const extractFacilityId = (item: GiftQueueMessage): string => {
  const { messageType } = item;
  switch (messageType) {
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
      return item.facilityId ?? 'UNKNOWN_FACILITY_ID';
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
      return (item.payload as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'UNKNOWN_FACILITY_ID';
    default:
      return throwIfNotExhaustive(messageType);
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
  const facilityId = extractFacilityId(item);

  try {
    switch (messageType) {
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
        await postToTfsApi(GIFT_API_URL.facilityCreation, item.payload, 'Failed to create GIFT facility', context);
        context.log('Gift facility creation succeeded');
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
        if (!item.facilityId) {
          throw new Error('Failed to amend GIFT facility: facilityId is missing from queue message');
        }
        await postToTfsApi(GIFT_API_URL.facilityAmendment(item.facilityId), item.payload, 'Failed to amend GIFT facility', context);
        context.log('Gift facility amendment succeeded');
        break;
      default:
        throwIfNotExhaustive(messageType);
    }
  } catch (error) {
    if (context.triggerMetadata.dequeueCount === maxNumberOfRetries) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await createHaloTicket(facilityId, queueItem, errorMessage, messageType, context);
    }
    throw error;
  }
}
