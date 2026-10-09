import {
  GIFT_QUEUE_MESSAGE_TYPE,
  GiftFacilityAmendmentMessage,
  GiftFacilityCreationMessage,
  GiftFacilityGetManyMessage,
  GiftFacilityMultipleAmendmentsMessage,
  GiftQueueMessage,
} from '../types/queue-message.type';

const extractAmendmentFacilityId = (message: GiftFacilityAmendmentMessage | GiftFacilityMultipleAmendmentsMessage): string =>
  message.facilityId ?? 'UNKNOWN_FACILITY_ID';

const extractCreationFacilityId = (message: GiftFacilityCreationMessage): string =>
  (message.payload as Record<string, Record<string, string>>)?.overview?.facilityId ?? 'UNKNOWN_FACILITY_ID';

const extractGetManyFacilityId = (message: GiftFacilityGetManyMessage): string => message.ids?.join(',') || 'UNKNOWN_FACILITY_ID';

/**
 * Extracts the facility ID or IDs from a queue message.
 * For amendments and gets, reads facilityId directly from the message.
 * For creations, reads it from the nested payload overview.
 * For get-many, joins the ids array.
 *
 * @param item - The raw queue message payload (typed as `unknown` to safely handle malformed items).
 * @returns Facility ID(s) string, or `'UNKNOWN_FACILITY_ID'` if it cannot be determined.
 */
export const extractFacilityIds = (item: unknown): string => {
  if (item === null || typeof item !== 'object') {
    return 'UNKNOWN_FACILITY_ID';
  }
  const message = item as GiftQueueMessage;
  switch (message.messageType) {
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT:
      return extractAmendmentFacilityId(message);
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION:
      return extractCreationFacilityId(message);
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_MULTIPLE_AMENDMENTS:
      return extractAmendmentFacilityId(message);
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET:
      return message.facilityId ?? 'UNKNOWN_FACILITY_ID';
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY:
      return extractGetManyFacilityId(message);
    default:
      return 'UNKNOWN_FACILITY_ID';
  }
};
