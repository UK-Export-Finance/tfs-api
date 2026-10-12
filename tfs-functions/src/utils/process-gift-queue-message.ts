import { InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';
import { createHaloTicket } from './create-halo-ticket';
import { requireEnvInt } from './env';
import { extractFacilityIds } from './extract-facility-id';
import { getFromTfsApi } from './get-from-tfs-api';
import { postToTfsApi } from './post-to-tfs-api';

const maxNumberOfRetries = requireEnvInt('GIFT_MAX_NUMBER_OF_RETRIES');

/**
 * Exhaustiveness check for switch statements over discriminated unions.
 * TypeScript will error at compile time if any union member is unhandled.
 * Throws at runtime if an unexpected value reaches the default branch.
 *
 * @param value - The unhandled value (typed `never` to enforce exhaustiveness).
 * @throws {Error} Always — with a message containing the unhandled value.
 */
const throwIfNotExhaustive = (value: never): never => {
  throw new Error(`APIM TFS - Unhandled message type: ${value}`);
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
  const facilityId = extractFacilityIds(item);

  try {
    switch (messageType) {
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
        await postToTfsApi('facilityCreation', '', item.payload, `Failed to create GIFT facility ${facilityId}`, context);
        context.log('GIFT facility creation succeeded for facilityId:', facilityId);
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
        if (!item.facilityId) {
          throw new Error('Failed to amend GIFT facility: facilityId is missing from queue message');
        }

        await postToTfsApi('facilityAmendment', item.facilityId, item.payload, `Failed to amend GIFT facility ${facilityId}`, context);
        context.log('GIFT facility amendment succeeded for facilityId:', facilityId);
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_MULTIPLE_AMENDMENTS:
        if (!item.facilityId) {
          throw new Error('Failed to amend GIFT facility (multiple amendments): facilityId is missing from queue message');
        }

        await postToTfsApi(
          'facilityMultipleAmendments',
          item.facilityId,
          item.payload,
          `Failed to amend GIFT facility (multiple amendments) ${facilityId}`,
          context,
        );
        context.log('GIFT facility amendment (multiple amendments) succeeded for facilityId:', facilityId);
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET:
        if (!item.facilityId) {
          throw new Error('Failed to get GIFT facility: facilityId is missing from queue message');
        }

        await getFromTfsApi('facility', item.facilityId, {}, `Failed to get GIFT facility ${facilityId}`, context);
        context.log('GIFT facility retrieval succeeded for facilityId:', facilityId);
        break;
      case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY:
        if (!item.ids?.length) {
          throw new Error('Failed to get GIFT facilities: ids is missing from queue message');
        }

        await getFromTfsApi('facilities', '', { ids: item.ids.join(',') }, `Failed to get GIFT facilities ${facilityId}`, context);
        context.log('GIFT facilities retrieval succeeded for ids:', facilityId);
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
