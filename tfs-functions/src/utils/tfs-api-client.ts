import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { requireEnv } from './env';

const baseUrl = requireEnv('APIM_TFS_URL');
const apimKeyHeaderName = requireEnv('APIM_TFS_KEY');
const apimKeyHeaderValue = requireEnv('APIM_TFS_VALUE');

/**
 * Headers required by every TFS API request.
 */
export const tfsApiHeaders = {
  [apimKeyHeaderName]: apimKeyHeaderValue,
  accept: 'application/json',
};

const ALLOWED_CHARACTERS = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,');

/**
 * Checks `id` contains only safe characters for substitution into a hardcoded endpoint template
 * (no `/`, `:`, `.`, so it can never add a path segment, scheme, or host).
 */
const isSafeIdSegment = (id: string): boolean => [...id].every((character) => ALLOWED_CHARACTERS.has(character));

/**
 * Builds the full URL for a hardcoded `endpoints` whitelist entry, after validating `id`.
 * Every request is built from one of the caller's hardcoded templates, with only a validated id
 * segment substituted in - the caller of getFromTfsApi/postToTfsApi can never supply an arbitrary
 * path or URL. Throws (and logs via `context`) if `id` contains anything unsafe.
 *
 * @param endpoints - Whitelist of hardcoded path templates, keyed by endpoint name.
 * @param endpoint - Which template in `endpoints` to request.
 * @param id - The id segment to substitute into the template (pass '' for templates that take none).
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to get GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 */
export function buildTfsApiUrl<Endpoint extends string>(
  endpoints: Record<Endpoint, (id: string) => string>,
  endpoint: Endpoint,
  id: string,
  errorPrefix: string,
  context: InvocationContext,
): string {
  if (!isSafeIdSegment(id)) {
    const message = `${errorPrefix}, refused to request with an invalid id: ${id}`;

    context.error(message);
    throw new Error(message);
  }

  return `${baseUrl}${endpoints[endpoint](id)}`;
}

/**
 * Logs (via `context`) and throws a descriptive Error for any TFS API request failure, normalizing
 * AxiosError / Error / unknown shapes into a single consistent message format.
 *
 * @param error - The error caught from the failed request.
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to get GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 */
export function throwTfsApiError(error: unknown, errorPrefix: string, context: InvocationContext): never {
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
