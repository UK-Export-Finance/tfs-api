import { app, InvocationContext } from '@azure/functions';

const baseUrl = process.env.TFS_API_BASE_URL;
const apiKey = process.env.TFS_API_KEY;
const giftVersion = process.env.TFS_API_GIFT_VERSION;

if (!baseUrl || !apiKey || !giftVersion) {
  throw new Error('Missing required environment variables: TFS_API_BASE_URL, TFS_API_KEY, TFS_API_GIFT_VERSION');
}

const facilityUrl = `${baseUrl}/gift/v${giftVersion}/facility`;

export async function processQueueItem(queueItem: unknown, context: InvocationContext): Promise<void> {
  context.log('Gift requests queue function received item:', queueItem);

  const response = await fetch(facilityUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(queueItem),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    context.error('Gift facility creation failed. Status: %d, Body: %s', response.status, responseBody);
    throw new Error(`Gift facility creation failed with status ${response.status}`);
  }

  context.log('Gift facility creation succeeded. Status: %d', response.status);
}

app.storageQueue('processQueueItem', {
  queueName: 'gift-requests',
  connection: 'AzureWebJobsStorage',
  handler: processQueueItem,
});
