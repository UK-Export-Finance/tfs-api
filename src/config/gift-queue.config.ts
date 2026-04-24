import { registerAs } from '@nestjs/config';

export const KEY = 'giftQueue';

export interface GiftQueueConfig {
  connectionString: string;
  queueName: string;
}

export default registerAs(
  KEY,
  (): GiftQueueConfig => ({
    connectionString: process.env.GIFT_QUEUE_STORAGE_CONNECTION_STRING,
    queueName: process.env.GIFT_QUEUE_NAME ?? 'gift-requests',
  }),
);
