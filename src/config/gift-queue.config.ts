import { registerAs } from '@nestjs/config';

const KEY = 'giftQueue';

export { KEY as GIFT_QUEUE_CONFIG_KEY };

export type GiftQueueConfigType = {
  storageAccountName?: string;
  connectionString?: string;
  clientId?: string;
  queueName: string;
};

export const GiftQueueConfig = registerAs(KEY, (): GiftQueueConfigType => ({
  storageAccountName: process.env.GIFT_QUEUE_STORAGE_ACCOUNT_NAME,
  connectionString: process.env.GIFT_QUEUE_STORAGE_CONNECTION_STRING,
  clientId: process.env.AZURE_CLIENT_ID,
  queueName: process.env.GIFT_QUEUE_NAME ?? 'gift-requests',
}));
