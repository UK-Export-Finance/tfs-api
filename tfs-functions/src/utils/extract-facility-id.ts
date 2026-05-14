import { GIFT_QUEUE_MESSAGE_TYPE, GiftQueueMessage } from '../types/queue-message.type';

/**
 * Extracts the facility ID from a queue message.
 * For amendments, reads facilityId directly from the message.
 * For creations, reads it from the nested payload overview.
 *
 * @param item - The parsed GIFT queue message.
 * @returns The facility ID string, or `'UNKNOWN_FACILITY_ID'` if it cannot be determined.
 */
export const extractFacilityId = (item: GiftQueueMessage): string => {
  switch (item.messageType) {
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
      return item.facilityId ?? 'UNKNOWN_FACILITY_ID';
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
      return (item.payload as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'UNKNOWN_FACILITY_ID';
    default:
      return 'UNKNOWN_FACILITY_ID';
  }
};
