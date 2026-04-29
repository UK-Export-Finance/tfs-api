import { registerAs } from '@nestjs/config';

export const KEY = 'giftQueue';

export interface GiftQueueConfig {
  storageAccountName: string | undefined;
  connectionString: string | undefined;
  queueName: string;
}

export default registerAs(
  KEY,
  (): GiftQueueConfig => ({
    storageAccountName: process.env.GIFT_QUEUE_STORAGE_ACCOUNT_NAME,
    connectionString: process.env.GIFT_QUEUE_STORAGE_CONNECTION_STRING,
    queueName: process.env.GIFT_QUEUE_NAME ?? 'gift-requests',
  }),
);
