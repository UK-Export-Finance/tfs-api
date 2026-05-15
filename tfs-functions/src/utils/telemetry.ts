import { DefaultAzureCredential } from '@azure/identity';
import appInsights from 'applicationinsights';

let hasStartedTelemetry = false;

/**
 * Returns the Application Insights telemetry client, initialising it on first call.
 * Returns `null` if `APPLICATIONINSIGHTS_CONNECTION_STRING` is not set, disabling all telemetry.
 */
const getTelemetryClient = () => {
  // Not required; if the connection string is not set, telemetry will be disabled and calls to trackEvent and trackException will be no-ops
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    return null;
  }

  if (!hasStartedTelemetry) {
    const managedIdentityClientId = process.env.AZURE_CLIENT_ID;
    appInsights.setup(connectionString).start();
    appInsights.defaultClient.config.aadTokenCredential = new DefaultAzureCredential({ managedIdentityClientId });
    hasStartedTelemetry = true;
  }

  return appInsights.defaultClient;
};

/**
 * Tracks a named custom event in Application Insights with the given properties.
 * No-op if Application Insights is not configured.
 *
 * @param name - The event name (e.g. `'gift.queue.message.processed'`).
 * @param properties - Key-value string properties to attach to the event.
 */
export const trackEvent = (name: string, properties: Record<string, string>): void => {
  const client = getTelemetryClient();

  if (!client) {
    return;
  }

  client.trackEvent({ name, properties });
};

/**
 * Tracks an exception in Application Insights with the given properties.
 * Non-`Error` values are wrapped in a generic `Error` before being sent.
 * No-op if Application Insights is not configured.
 *
 * @param error - The caught error value.
 * @param properties - Key-value string properties to attach to the exception.
 */
export const trackException = (error: unknown, properties: Record<string, string>): void => {
  const client = getTelemetryClient();

  if (!client) {
    return;
  }

  client.trackException({
    exception: error instanceof Error ? error : new Error('Non-Error exception thrown'),
    properties,
  });
};
