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
 * Throws (and logs via `context`) if `id` contains anything other than safe characters (no `/`,
 * `:`, `.`, so it can never add a path segment, scheme, or host) before it is substituted into a
 * hardcoded endpoint template.
 *
 * @param id - The id segment about to be substituted into a path template.
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to get GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 */
export function assertSafeIdSegment(id: string, errorPrefix: string, context: InvocationContext): void {
  const isSafe = [...id].every((character) => ALLOWED_CHARACTERS.has(character));

  if (!isSafe) {
    const message = `${errorPrefix}, refused to request with an invalid id: ${id}`;

    context.error(message);
    throw new Error(message);
  }
}

/**
 * Resolves an already-built, hardcoded `path` against the configured TFS API base URL.
 *
 * @param path - A path produced from a hardcoded template (see e.g. resolveGetPath in get-from-tfs-api.ts).
 */
export const buildTfsApiUrl = (path: string): string => `${baseUrl}${path}`;

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
