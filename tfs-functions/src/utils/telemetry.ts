import appInsights from 'applicationinsights';

let hasStartedTelemetry = false;

const getTelemetryClient = () => {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    return null;
  }

  if (!hasStartedTelemetry) {
    appInsights.setup(connectionString).start();
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
