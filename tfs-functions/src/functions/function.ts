import { app, InvocationContext } from '@azure/functions';

export function processQueueItem(queueItem: unknown, context: InvocationContext): void {
  context.log('Storage queue function processed work item:', queueItem);
}

app.storageQueue('function', {
  queueName: 'js-queue-items',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
