import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { assertSafeIdSegment, buildTfsApiUrl, tfsApiHeaders, throwTfsApiError } from './tfs-api-client';

export type TfsGiftGetEndpoint = 'facility' | 'facilities';

/**
 * Resolves `endpoint` to its hardcoded path template, substituting the (already-validated) `id`.
 * Deliberately a switch rather than an object/array keyed by `endpoint`, so the path is never
 * derived via a dynamic property lookup.
 */
const resolveGetPath = (endpoint: TfsGiftGetEndpoint, id: string): string => {
  switch (endpoint) {
    case 'facility':
      return `/api/v2/gift/facility/${id}/without-queue`;
    case 'facilities':
      return '/api/v2/gift/facilities/without-queue';
  }
};

/**
 * Gets a resource from the TFS API, handling errors consistently.
 * Throws a descriptive Error on any failure.
 *
 * @param endpoint - Which hardcoded path template to request.
 * @param id - The id segment to substitute into the template (pass '' for templates that take none).
 * @param params - Query string parameters, passed to axios so values are safely encoded.
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to get GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 * @returns the response body from the TFS API.
 */
export async function getFromTfsApi(
  endpoint: TfsGiftGetEndpoint,
  id: string,
  params: Record<string, string>,
  errorPrefix: string,
  context: InvocationContext,
): Promise<unknown> {
  assertSafeIdSegment(id, errorPrefix, context);

  const url = buildTfsApiUrl(resolveGetPath(endpoint, id));

  let response;

  try {
    /**
     * nosemgrep: url is always baseUrl + one of the two hardcoded templates above, with only a
     * character-validated id substituted in - it can never point outside the TFS API host.
     */
    response = await axios.get(url, { params, headers: tfsApiHeaders });
  } catch (error) {
    throwTfsApiError(error, errorPrefix, context);
  }

  return response.data;
}
