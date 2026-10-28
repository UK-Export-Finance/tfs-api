import {
  GIFT_QUEUE_MESSAGE_TYPE,
  GiftFacilityAmendmentMessage,
  GiftFacilityCreationMessage,
  GiftFacilityGetManyMessage,
  GiftFacilityMultipleAmendmentsMessage,
  GiftQueueMessage,
} from '../types/queue-message.type';

/**
 * Extracts the facility ID from a GIFT facility amendment or multiple amendments message.
 * @param {GiftFacilityAmendmentMessage | GiftFacilityMultipleAmendmentsMessage} message - The GIFT facility amendment message.
 * @returns {string} The facility ID from the amendment message, or `'UNKNOWN_FACILITY_ID'` if it cannot be determined.
 */
const extractAmendmentFacilityId = (message: GiftFacilityAmendmentMessage | GiftFacilityMultipleAmendmentsMessage): string =>
  (message as { facilityId?: string }).facilityId ?? 'UNKNOWN_FACILITY_ID';

type GiftFacilityCreationPayload = { overview?: { facilityId?: string } };

/**
 * Extracts the facility ID from a GIFT facility creation message.
 * @param {GiftFacilityCreationMessage} message - The GIFT facility creation message.
 * @returns {string} The facility ID from the creation message, or `'UNKNOWN_FACILITY_ID'` if it cannot be determined.
 */
const extractCreationFacilityId = (message: GiftFacilityCreationMessage): string => {
  const payload = message.payload as GiftFacilityCreationPayload | undefined;

  return payload?.overview?.facilityId ?? 'UNKNOWN_FACILITY_ID';
};

const extractGetManyFacilityId = (message: GiftFacilityGetManyMessage): string => message.ids.join(',') || 'UNKNOWN_FACILITY_ID';

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
      return message.facilityId;
    case GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY:
      return extractGetManyFacilityId(message);
    default:
      return 'UNKNOWN_FACILITY_ID';
  }
};
