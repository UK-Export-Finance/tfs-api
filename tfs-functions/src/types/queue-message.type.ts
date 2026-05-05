export const GIFT_QUEUE_MESSAGE_TYPE = {
  FACILITY_CREATION: 'facility-creation',
  FACILITY_AMENDMENT: 'facility-amendment',
} as const;

export type GiftQueueMessageType = (typeof GIFT_QUEUE_MESSAGE_TYPE)[keyof typeof GIFT_QUEUE_MESSAGE_TYPE];

export const GIFT_QUEUE_OPERATION_LABEL: Record<GiftQueueMessageType, string> = {
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION]: 'creation',
  [GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT]: 'amendment',
};

export type GiftQueueMessage = {
  messageType: GiftQueueMessageType;
  facilityId?: string;
  payload: unknown;
};
