import { InvocationContext } from '@azure/functions';
import axios from 'axios';

const { HALO_BASE_URL: baseUrl, HALO_TENANT_NAME: tenantName, HALO_CLIENT_ID: clientId, HALO_CLIENT_SECRET: clientSecret } = process.env;

const haloTokenUrl = `${baseUrl}/token?tenant=${tenantName}`;
const haloTicketsUrl = `${baseUrl}/Tickets`;

/**
 * Acquires an OAuth2 access token from Halo using client credentials.
 */
async function getHaloAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await axios.post(haloTokenUrl, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.access_token as string;
}

/**
 * Raises a Halo support ticket when a GIFT facility creation request fails.
 *
 * @param facilityId - The facility ID from the original DTFS payload (or 'unknown' if not present).
 * @param payload - The original payload sent by DTFS.
 * @param errorMessage - The formatted error message from the failed GIFT request.
 * @param context - The Azure Functions invocation context for logging.
 */
export async function createHaloTicket(facilityId: string, payload: unknown, errorMessage: string, context: InvocationContext): Promise<void> {
  context.log('Raising Halo ticket for failed GIFT facility creation, facilityId:', facilityId);

  let accessToken: string;

  try {
    accessToken = await getHaloAccessToken();
  } catch (error) {
    const message = error instanceof Error ? `Failed to acquire Halo access token: ${error.message}` : 'Failed to acquire Halo access token: unknown error';
    context.error(message);
    throw new Error(message);
  }

  try {
    // TODO 637: confirm Halo ticket type and required fields
    await axios.post(
      haloTicketsUrl,
      [
        {
          summary: `APIM Error submitting DTFS facility ${facilityId} to GIFT`,
          details: `Error: ${errorMessage}\n\nOriginal payload:\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? `Failed to create Halo ticket: ${error.message}` : 'Failed to create Halo ticket: unknown error';
    context.error(message);
    throw new Error(message);
  }

  context.log('Halo ticket raised successfully for facilityId:', facilityId);
}
