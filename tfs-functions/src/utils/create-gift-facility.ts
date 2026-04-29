import { InvocationContext } from '@azure/functions';
import axios from 'axios';

const { TFS_API_BASE_URL: baseUrl, TFS_API_KEY: apiKey } = process.env;

const facilityCreationUrl = `${baseUrl}/api/v2/gift/facility`;

/**
 * Creates a GIFT facility by posting the queue item to the TFS API.
 *
 * @param queueItem - The queue item to process.
 * @param context - The context object for the function invocation.
 */
export async function createGiftFacility(queueItem: unknown, context: InvocationContext): Promise<void> {
  let response;

  try {
    response = await axios.post(facilityCreationUrl, queueItem, {
      headers: {
        'x-api-key': apiKey,
        accept: 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const message = `Failed to create GIFT facility, error: ${error.message}`;
      context.error(message);
      throw new Error(message);
    }

    const message = 'Failed to create GIFT facility, unknown error';
    context.error(message);
    throw new Error(message);
  }

  if (response.status !== 201) {
    const message = `Failed to create GIFT facility, status: ${response.status}, response: ${JSON.stringify(response.data)}`;
    context.error(message);
    throw new Error('Failed to create GIFT facility');
  }
}
