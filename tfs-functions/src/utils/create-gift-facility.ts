import { InvocationContext } from '@azure/functions';
import axios from 'axios';
import { requireEnv } from 'utils/env';

const baseUrl = requireEnv('TFS_API_BASE_URL');
const apiKey = requireEnv('TFS_API_KEY');

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
    if (axios.isAxiosError(error)) {
      const responseBody = error.response?.data ? JSON.stringify(error.response.data) : 'no response body';
      const message = `Failed to create GIFT facility, status: ${error.response?.status ?? 'unknown'}, error: ${error.message}, response: ${responseBody}`;
      context.error(message);
      throw new Error(message);
    }

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
