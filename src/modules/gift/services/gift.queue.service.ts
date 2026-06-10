import { DefaultAzureCredential } from '@azure/identity';
import { QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GiftQueueConfig, KEY as GIFT_QUEUE_CONFIG_KEY } from '@ukef/config/gift-queue.config';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for interacting with the GIFT Azure Storage Queue.
 * Handles encoding and enqueuing of GIFT facility request messages.
 */
@Injectable()
export class GiftQueueService {
  private readonly queueClient: QueueClient;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    const { storageAccountName, connectionString, clientId, queueName } = this.configService.get<GiftQueueConfig>(GIFT_QUEUE_CONFIG_KEY);
    if (!connectionString && !storageAccountName) {
      throw new Error('Either GIFT_QUEUE_STORAGE_CONNECTION_STRING or GIFT_QUEUE_STORAGE_ACCOUNT_NAME must be set');
    }
    // connectionString is for local dev only, should not be used in production
    const serviceClient = connectionString
      ? QueueServiceClient.fromConnectionString(connectionString)
      : new QueueServiceClient(`https://${storageAccountName}.queue.core.windows.net`, new DefaultAzureCredential({ managedIdentityClientId: clientId }));
    this.queueClient = serviceClient.getQueueClient(queueName);
  }

  /**
   * Encodes the given payload as a Base64 JSON string and sends it
   * to the GIFT requests queue.
   * @param payload - The message payload to enqueue.
   */
  async enqueue(payload: object): Promise<void> {
    const message = Buffer.from(JSON.stringify(payload)).toString('base64');
    this.logger.info('Enqueuing GIFT request message');
    await this.queueClient.sendMessage(message);
    this.logger.info('GIFT request message enqueued');
  }
}
