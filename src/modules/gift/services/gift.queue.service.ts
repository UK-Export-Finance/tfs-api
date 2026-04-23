import { DefaultAzureCredential } from '@azure/identity';
import { QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GiftQueueConfig, KEY as GIFT_QUEUE_CONFIG_KEY } from '@ukef/config/gift-queue.config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class GiftQueueService {
  private readonly queueClient: QueueClient;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    const { storageAccountName, connectionString, queueName } = this.configService.get<GiftQueueConfig>(GIFT_QUEUE_CONFIG_KEY);
    const serviceClient = connectionString
      ? QueueServiceClient.fromConnectionString(connectionString)
      : new QueueServiceClient(`https://${storageAccountName}.queue.core.windows.net`, new DefaultAzureCredential());
    this.queueClient = serviceClient.getQueueClient(queueName);
  }

  async enqueue(payload: object): Promise<void> {
    const message = Buffer.from(JSON.stringify(payload)).toString('base64');
    this.logger.info('Enqueuing gift request message');
    await this.queueClient.sendMessage(message);
    this.logger.info('Gift request message enqueued');
  }
}
