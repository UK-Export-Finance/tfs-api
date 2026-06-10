export const GIFT_QUEUE_MESSAGE_TYPE = {
  FACILITY_CREATION: 'FACILITY_CREATION',
  FACILITY_AMENDMENT: 'FACILITY_AMENDMENT',
} as const;

export type GiftQueueMessageType = (typeof GIFT_QUEUE_MESSAGE_TYPE)[keyof typeof GIFT_QUEUE_MESSAGE_TYPE];

export const GIFT_QUEUE_OPERATION_LABEL: Record<GiftQueueMessageType, string> = {
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION]: 'creation',
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT]: 'amendment',
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

export type GiftQueueMessage = GiftFacilityCreationMessage | GiftFacilityAmendmentMessage;
