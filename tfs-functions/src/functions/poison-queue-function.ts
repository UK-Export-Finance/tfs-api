import { app, InvocationContext } from '@azure/functions';

export function processPoisonQueueItem(queueItem: unknown, context: InvocationContext): void {
  context.log('Gift requests item added to poison queue:', queueItem);
}

app.storageQueue('processPoisonQueueItem', {
  queueName: 'gift-requests-poison',
  connection: 'AzureWebJobsStorage',
  handler: processPoisonQueueItem,
});
