import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { requireEnv } from './env';

const baseUrl = requireEnv('APIM_TFS_URL');
const baseOrigin = new URL(baseUrl).origin;
const apimKeyHeaderName = requireEnv('APIM_TFS_KEY');
const apimKeyHeaderValue = requireEnv('APIM_TFS_VALUE');

/**
 * Matches a plain site-relative path (e.g. `/api/v2/gift/facility/0011111111`).
 * Rejects anything containing a scheme/host component (`:`, a leading `//`) so a tainted
 * `path` can never be resolved as an absolute URL to a different origin.
 */
const SAFE_RELATIVE_PATH_REGEX = /^\/(?!\/)[A-Za-z0-9/_,-]*$/;

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

  if (!SAFE_RELATIVE_PATH_REGEX.test(path)) {
    const message = `${errorPrefix}, refused to request an invalid path: ${path}`;

    context.error(message);
    throw new Error(message);
  }

  /**
   * NOTE: path is resolved against baseUrl (rather than concatenated), so that user-controlled
   * path segments cannot be used to escape the TFS API host/path.
   */
  const url = new URL(path, baseUrl);

  /**
   * `new URL(path, baseUrl)` resolves `path` as an absolute URL (ignoring baseUrl entirely) if it
   * looks like one (e.g. starts with a scheme or `//`). Reject anything that would send the request
   * to a different origin, so a tainted `path` can never be used for SSRF.
   */
  if (url.origin !== baseOrigin) {
    const message = `${errorPrefix}, refused to request a URL outside the TFS API origin: ${url.origin}`;

    context.error(message);
    throw new Error(message);
  }

  try {
    response = await axios.get(url.toString(), {
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
