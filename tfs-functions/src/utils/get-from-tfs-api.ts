import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { buildTfsApiUrl, tfsApiHeaders, throwTfsApiError } from './tfs-api-client';

/**
 * Whitelist of the only GET endpoints this function is allowed to call. Every request is built
 * from one of these hardcoded templates, with only a validated id segment substituted in - the
 * caller can never supply an arbitrary path or URL.
 */
const TFS_GIFT_GET_ENDPOINTS = {
  facility: (facilityId: string) => `/api/v2/gift/facility/${facilityId}/without-queue`,
  facilities: () => '/api/v2/gift/facilities/without-queue',
} as const;

export type TfsGiftGetEndpoint = keyof typeof TFS_GIFT_GET_ENDPOINTS;

/**
 * Gets a resource from the TFS API, handling errors consistently.
 * Throws a descriptive Error on any failure.
 *
 * @param endpoint - Which hardcoded TFS_GIFT_GET_ENDPOINTS template to request.
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
  const url = buildTfsApiUrl(TFS_GIFT_GET_ENDPOINTS, endpoint, id, errorPrefix, context);

  let response;

  try {
    response = await axios.get(url, { params, headers: tfsApiHeaders });
  } catch (error) {
    throwTfsApiError(error, errorPrefix, context);
  }

  return response.data;
}
