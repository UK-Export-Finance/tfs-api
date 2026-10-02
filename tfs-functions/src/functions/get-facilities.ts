import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { requireEnv } from '../utils/env';
import { getFromTfsApi } from '../utils/get-from-tfs-api';

const baseUrl = requireEnv('APIM_TFS_URL');

/**
 * HTTP-triggered function that fetches multiple GIFT facilities from tfs-api.
 * Raises a Halo ticket and returns a 502 response if the request fails.
 *
 * @param request - The incoming HTTP request, expecting an `ids` query parameter (comma separated facility IDs).
 * @param context - The Azure Functions invocation context for logging.
 */
export async function getFacilities(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ids = request.query.get('ids') ?? '';

  context.log('Getting multiple GIFT facilities, ids:', ids);

  try {
    const data = await getFromTfsApi(`${baseUrl}/api/v2/gift/facilities?ids=${ids}`, `Failed to get GIFT facilities ${ids}`, context);

    return { status: 200, jsonBody: data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await createHaloTicket(ids, { ids }, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY, context);

    return { status: 502, jsonBody: { message: errorMessage } };
  }
}

app.http('getFacilities', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'gift/facilities',
  handler: getFacilities,
});
