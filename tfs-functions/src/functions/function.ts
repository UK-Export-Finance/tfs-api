import { app, InvocationContext } from '@azure/functions';

export function processQueueItem(queueItem: unknown, context: InvocationContext): void {
  context.log('Storage queue function processed work item:', queueItem);
}

app.storageQueue('processQueueItem', {
  queueName: 'gift-requests',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
