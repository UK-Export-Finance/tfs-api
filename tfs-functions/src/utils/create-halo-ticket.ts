import { InvocationContext } from '@azure/functions';
import axios from 'axios';

import { GIFT_QUEUE_OPERATION_LABEL, GiftQueueMessageType } from '../types/queue-message.type';
import { requireEnv, requireEnvInt } from './env';

const baseUrl = requireEnv('HALO_BASE_URL');
const tenantName = requireEnv('HALO_TENANT_NAME');
const clientId = requireEnv('HALO_AUTH_CLIENT_ID');
const clientSecret = requireEnv('HALO_CLIENT_SECRET');
const ticketClientId = requireEnvInt('HALO_TICKET_CLIENT_ID');
const ticketTypeId = requireEnvInt('HALO_TICKET_TYPE_ID');
const siteId = requireEnvInt('HALO_SITE_ID');
const userId = requireEnvInt('HALO_USER_ID');
const teamId = requireEnvInt('HALO_TEAM_ID');
const haloTicketsUrl = `${baseUrl}/api/Tickets`;

function formatError(prefix: string, error: unknown): string {
  return error instanceof Error ? `${prefix}: ${error.message}` : `${prefix}: unknown error`;
}

/**
 * Acquires an OAuth2 access token from Halo using client credentials.
 *
 * @param context - The Azure Functions invocation context for logging.
 * @returns the access token as a string.
 */
async function getHaloAccessToken(): Promise<string> {
  const haloTokenUrl = new URL('/auth/token', baseUrl);
  haloTokenUrl.searchParams.set('tenant', tenantName);

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await axios.post(haloTokenUrl.toString(), params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data.access_token as string;
}

/**
 * Builds the request body for creating a Halo ticket.
 *
 * @param facilityId - The facility ID from the original DTFS payload (or 'unknown' if not present).
 * @param payload - The original payload sent by a consumer (e.g. DTFS).
 * @param errorMessage - The formatted error message from the failed GIFT request.
 * @param messageType - The type of GIFT request that failed ('facility-creation' or 'facility-amendment').
 * @returns the request body to create a Halo ticket, formatted according to the Halo API requirements.
 */
function buildTicketBody(facilityId: string, payload: unknown, errorMessage: string, messageType: GiftQueueMessageType | undefined) {
  const operationType = GIFT_QUEUE_OPERATION_LABEL[messageType];
  return [
    {
      summary: `APIM Error submitting DTFS facility ${facilityId} ${operationType} to GIFT`,
      details: `Error: ${errorMessage}\n\nOriginal payload:\n${JSON.stringify(payload, null, 2)}`,
      tickettype_id: ticketTypeId,
      client_id: ticketClientId,
      site_id: siteId,
      user_id: userId,
      team_id: teamId,
      itil_tickettype_id: -1,
      dont_do_rules: true,
      donotapplytemplateintheapi: true,
      return_this: true,
    },
  ];
}

/**
 * Raises a Halo support ticket when a GIFT facility request fails.
 *
 * @param facilityId - The facility ID from the original DTFS payload (or 'unknown' if not present).
 * @param payload - The original payload sent by DTFS.
 * @param errorMessage - The formatted error message from the failed GIFT request.
 * @param messageType - The type of GIFT request that failed ('facility-creation' or 'facility-amendment').
 * @param context - The Azure Functions invocation context for logging.
 */
export async function createHaloTicket(
  facilityId: string,
  payload: unknown,
  errorMessage: string,
  messageType: GiftQueueMessageType,
  context: InvocationContext,
): Promise<void> {
  const operationType = GIFT_QUEUE_OPERATION_LABEL[messageType];
  context.log(`Raising Halo ticket for failed GIFT facility ${operationType}, facilityId:`, facilityId);

  let accessToken: string;
  try {
    accessToken = await getHaloAccessToken();
  } catch (error) {
    context.error(formatError('Failed to acquire Halo access token', error));
    return;
  }

  try {
    await axios.post(haloTicketsUrl, buildTicketBody(facilityId, payload, errorMessage, messageType), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    context.log('Halo ticket raised successfully for facilityId:', facilityId);
  } catch (error) {
    context.error(formatError('Failed to create Halo ticket', error));
  }
}
