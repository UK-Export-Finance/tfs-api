import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { HttpStatus } from '../constants/http-status.constant';
import { assertSafeIdSegment, buildTfsApiUrl, tfsApiHeaders, throwTfsApiError } from './tfs-api-client';

export type TfsGiftPostEndpoint = 'facilityCreation' | 'facilityAmendment' | 'facilityMultipleAmendments';

/**
 * Resolves `endpoint` to its hardcoded path template, substituting the (already-validated) `id`.
 * Deliberately a switch rather than an object/array keyed by `endpoint`, so the path is never
 * derived via a dynamic property lookup.
 */
const resolvePostPath = (endpoint: TfsGiftPostEndpoint, id: string): string => {
  switch (endpoint) {
    case 'facilityCreation':
      return '/api/v2/gift/facility/without-queue';
    case 'facilityAmendment':
      return `/api/v2/gift/facility/${id}/amendment/without-queue`;
    case 'facilityMultipleAmendments':
      return `/api/v2/gift/facility/${id}/multiple-amendments/without-queue`;
  }
};

/**
 * Posts a GIFT facility payload to the TFS API, handling errors consistently.
 * Throws a descriptive Error on any failure.
 *
 * @param endpoint - Which hardcoded path template to request.
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
  assertSafeIdSegment(id, errorPrefix, context);

  const url = buildTfsApiUrl(resolvePostPath(endpoint, id));

  let response;

  try {
    /**
     * nosemgrep: url is always baseUrl + one of the three hardcoded templates above, with only a
     * character-validated id substituted in - it can never point outside the TFS API host.
     */
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
