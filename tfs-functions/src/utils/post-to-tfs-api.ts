import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { requireEnv } from './env';

const apimKeyHeaderName = requireEnv('APIM_TFS_KEY');
const apimKeyHeaderValue = requireEnv('APIM_TFS_VALUE');

/**
 * Posts a GIFT facility payload to the TFS API, handling errors consistently.
 * Throws a descriptive Error on any failure.
 *
 * @param url - The full URL to POST to.
 * @param payload - The request body.
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to create GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 */
export async function postToTfsApi(url: string, payload: unknown, errorPrefix: string, context: InvocationContext): Promise<void> {
  let response;

  try {
    response = await axios.post(url, payload, {
      headers: {
        [apimKeyHeaderName]: apimKeyHeaderValue,
        accept: 'application/json',
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseBody = error.response?.data ? JSON.stringify(error.response.data) : 'no response body';
      const message = `${errorPrefix}, status: ${error.response?.status ?? 'unknown'}, error: ${error.message}, response: ${responseBody}`;
      context.error(message);
      throw new Error(message);
    }

    if (error instanceof Error) {
      const message = `${errorPrefix}, error: ${error.message}`;
      context.error(message);
      throw new Error(message);
    }

    const message = `${errorPrefix}, unknown error`;
    context.error(message);
    throw new Error(message);
  }

  if (response.status !== 201) {
    const message = `${errorPrefix}, status: ${response.status}, response: ${JSON.stringify(response.data)}`;
    context.error(message);
    throw new Error(message);
  }
}
