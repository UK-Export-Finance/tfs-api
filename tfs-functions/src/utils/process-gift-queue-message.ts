import { InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';
import { createHaloTicket } from './create-halo-ticket';
import { requireEnv, requireEnvInt } from './env';
import { extractFacilityId } from './extract-facility-id';
import { postToTfsApi } from './post-to-tfs-api';

const baseUrl = requireEnv('APIM_TFS_URL');
const maxNumberOfRetries = requireEnvInt('GIFT_MAX_NUMBER_OF_RETRIES');

const TFS_GIFT_INTERNAL_URLS = {
  facilityCreation: `${baseUrl}/api/v2/gift/facility/without-queue`,
  facilityAmendment: (facilityId: string) => `${baseUrl}/api/v2/gift/facility/${facilityId}/amendment/without-queue`,
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
        await postToTfsApi(TFS_GIFT_INTERNAL_URLS.facilityCreation, item.payload, `Failed to create GIFT facility ${facilityId}`, context);
        context.log('GIFT facility creation succeeded for facilityId:', facilityId);
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
        if (!item.facilityId) {
          throw new Error('Failed to amend GIFT facility: facilityId is missing from queue message');
        }
        await postToTfsApi(TFS_GIFT_INTERNAL_URLS.facilityAmendment(item.facilityId), item.payload, `Failed to amend GIFT facility ${facilityId}`, context);
        context.log('GIFT facility amendment succeeded for facilityId:', facilityId);
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
