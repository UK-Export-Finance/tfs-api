import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { getFromTfsApi } from '../utils/get-from-tfs-api';

/**
 * HTTP-triggered function that fetches a single GIFT facility from tfs-api.
 * Raises a Halo ticket and returns a 502 response if the request fails.
 *
 * @param request - The incoming HTTP request, expecting a `facilityId` route parameter.
 * @param context - The Azure Functions invocation context for logging.
 */
export async function getFacility(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { facilityId } = request.params;

  context.log('Getting a GIFT facility, facilityId:', facilityId);

  try {
    const path = `/api/v2/gift/facility/${encodeURIComponent(facilityId)}/without-queue`;

    const data = await getFromTfsApi(path, {}, `Failed to get GIFT facility ${facilityId}`, context);

    return { status: 200, jsonBody: data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await createHaloTicket(facilityId, { facilityId }, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET, context);

    return { status: 502, jsonBody: { message: errorMessage } };
  }
}

app.http('getFacility', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'gift/facility/{facilityId}',
  handler: getFacility,
});
