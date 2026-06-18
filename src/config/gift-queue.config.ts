import { registerAs } from '@nestjs/config';

export const KEY = 'giftQueue';

export interface GiftQueueConfig {
  storageAccountName?: string;
  connectionString?: string;
  clientId?: string;
  queueName: string;
}

export default registerAs(
  KEY,
  (): GiftQueueConfig => ({
    storageAccountName: process.env.GIFT_QUEUE_STORAGE_ACCOUNT_NAME,
    connectionString: process.env.GIFT_QUEUE_STORAGE_CONNECTION_STRING,
    clientId: process.env.AZURE_CLIENT_ID,
    queueName: process.env.GIFT_QUEUE_NAME ?? 'gift-requests',
  }),
);
