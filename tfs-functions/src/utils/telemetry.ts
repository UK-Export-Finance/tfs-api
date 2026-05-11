import { DefaultAzureCredential } from '@azure/identity';
import appInsights from 'applicationinsights';

let hasStartedTelemetry = false;

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

export const trackEvent = (name: string, properties: Record<string, string>): void => {
  const client = getTelemetryClient();

  if (!client) {
    return;
  }

  client.trackEvent({ name, properties });
};

export const trackException = (error: unknown, properties: Record<string, string>): void => {
  const client = getTelemetryClient();

  if (!client) {
    return;
  }

  client.trackException({
    exception: error instanceof Error ? error : new Error(String(error)),
    properties,
  });
};
