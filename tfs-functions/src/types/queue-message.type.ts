export const GIFT_QUEUE_MESSAGE_TYPE = {
  FACILITY_CREATION: 'FACILITY_CREATION',
  FACILITY_AMENDMENT: 'FACILITY_AMENDMENT',
  FACILITY_MULTIPLE_AMENDMENTS: 'FACILITY_MULTIPLE_AMENDMENTS',
  /**
   * NOTE: These 2 types are not queued messages - they're used by the HTTP-triggered
   * get-facility/get-facilities functions, purely to label Halo tickets consistently.
   */
  FACILITY_GET: 'FACILITY_GET',
  FACILITY_GET_MANY: 'FACILITY_GET_MANY',
} as const;

export type GiftQueueMessageType = (typeof GIFT_QUEUE_MESSAGE_TYPE)[keyof typeof GIFT_QUEUE_MESSAGE_TYPE];

export const GIFT_QUEUE_OPERATION_LABEL: Record<GiftQueueMessageType, string> = {
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION]: 'creation',
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT]: 'amendment',
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_MULTIPLE_AMENDMENTS]: 'multiple amendments',
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET]: 'retrieval',
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY]: 'retrieval (multiple)',
};

export type GiftFacilityCreationMessage = {
  messageType: typeof GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION;
  payload: unknown;
};

export type GiftFacilityAmendmentMessage = {
  messageType: typeof GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT;
  facilityId: string;
  payload: unknown;
};

export type GiftFacilityMultipleAmendmentsMessage = {
  messageType: typeof GIFT_QUEUE_MESSAGE_TYPE.FACILITY_MULTIPLE_AMENDMENTS;
  facilityId: string;
  payload: unknown;
};

export type GiftQueueMessage = GiftFacilityCreationMessage | GiftFacilityAmendmentMessage | GiftFacilityMultipleAmendmentsMessage;
