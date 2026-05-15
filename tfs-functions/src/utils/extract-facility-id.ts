import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';

/**
 * Extracts the facility ID from a queue message.
 * For amendments, reads facilityId directly from the message.
 * For creations, reads it from the nested payload overview.
 *
 * @param item - The raw queue message payload (typed as `unknown` to safely handle malformed items).
 * @returns The facility ID string, or `'UNKNOWN_FACILITY_ID'` if it cannot be determined.
 */
export const extractFacilityId = (item: unknown): string => {
  if (item === null || typeof item !== 'object') {
    return 'UNKNOWN_FACILITY_ID';
  }
  const message = item as GiftQueueMessage;
  switch (message.messageType) {
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
      return message.facilityId ?? 'UNKNOWN_FACILITY_ID';
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
      return (message.payload as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'UNKNOWN_FACILITY_ID';
    default:
      return 'UNKNOWN_FACILITY_ID';
  }
};
