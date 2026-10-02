import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { requireEnv } from './env';

const baseUrl = requireEnv('APIM_TFS_URL');
const apimKeyHeaderName = requireEnv('APIM_TFS_KEY');
const apimKeyHeaderValue = requireEnv('APIM_TFS_VALUE');

/**
 * Gets a resource from the TFS API, handling errors consistently.
 * Throws a descriptive Error on any failure.
 *
 * @param path - The path to GET, relative to the TFS API base URL (e.g. '/api/v2/gift/facility/0011111111').
 * @param params - Query string parameters, passed to axios so values are safely encoded.
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to get GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 * @returns the response body from the TFS API.
 */
export async function getFromTfsApi(path: string, params: Record<string, string>, errorPrefix: string, context: InvocationContext): Promise<unknown> {
  let response;

  /**
   * NOTE: path is resolved against baseUrl (rather than concatenated), so that user-controlled
   * path segments cannot be used to escape the TFS API host/path.
   */
  const url = new URL(path, baseUrl).toString();

  try {
    response = await axios.get(url, {
      params,
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

  return response.data;
}
