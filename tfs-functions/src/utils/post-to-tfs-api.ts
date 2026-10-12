import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { HttpStatus } from '../constants/http-status.constant';
import { buildTfsApiUrl, tfsApiHeaders, throwTfsApiError } from './tfs-api-client';

/**
 * Whitelist of the only POST endpoints this function is allowed to call. Every request is built
 * from one of these hardcoded templates, with only a validated id segment substituted in - the
 * caller can never supply an arbitrary URL.
 */
const TFS_GIFT_POST_ENDPOINTS = {
  facilityCreation: () => '/api/v2/gift/facility/without-queue',
  facilityAmendment: (facilityId: string) => `/api/v2/gift/facility/${facilityId}/amendment/without-queue`,
  facilityMultipleAmendments: (facilityId: string) => `/api/v2/gift/facility/${facilityId}/multiple-amendments/without-queue`,
} as const;

export type TfsGiftPostEndpoint = keyof typeof TFS_GIFT_POST_ENDPOINTS;

/**
 * Posts a GIFT facility payload to the TFS API, handling errors consistently.
 * Throws a descriptive Error on any failure.
 *
 * @param endpoint - Which hardcoded TFS_GIFT_POST_ENDPOINTS template to request.
 * @param id - The id segment to substitute into the template (pass '' for templates that take none).
 * @param payload - The request body.
 * @param errorPrefix - Prefix for all error messages, e.g. 'Failed to create GIFT facility'.
 * @param context - The Azure Functions invocation context for logging.
 */
export async function postToTfsApi(
  endpoint: TfsGiftPostEndpoint,
  id: string,
  payload: unknown,
  errorPrefix: string,
  context: InvocationContext,
): Promise<void> {
  const url = buildTfsApiUrl(TFS_GIFT_POST_ENDPOINTS, endpoint, id, errorPrefix, context);

  let response;

  try {
    response = await axios.post(url, payload, { headers: tfsApiHeaders });
  } catch (error) {
    throwTfsApiError(error, errorPrefix, context);
  }

  if (response.status !== HttpStatus.CREATED) {
    const message = `${errorPrefix}, status: ${response.status}, response: ${JSON.stringify(response.data)}`;
    context.error(message);
    throw new Error(message);
  }
}
