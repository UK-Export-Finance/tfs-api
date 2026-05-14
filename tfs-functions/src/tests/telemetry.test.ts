describe('telemetry', () => {
  const connectionString = 'InstrumentationKey=test-key';
  const managedIdentityClientId = 'test-client-id';

  let trackEvent: (name: string, properties: Record<string, string>) => void;
  let trackException: (error: unknown, properties: Record<string, string>) => void;
  let mockSetup: jest.Mock;
  let mockStart: jest.Mock;
  let mockTrackEvent: jest.Mock;
  let mockTrackException: jest.Mock;
  let MockDefaultAzureCredential: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    mockStart = jest.fn();
    mockSetup = jest.fn().mockReturnValue({ start: mockStart });
    mockTrackEvent = jest.fn();
    mockTrackException = jest.fn();
    MockDefaultAzureCredential = jest.fn();

    jest.doMock('@azure/identity', () => ({ DefaultAzureCredential: MockDefaultAzureCredential }));
    jest.doMock('applicationinsights', () => ({
      __esModule: true,
      default: {
        setup: mockSetup,
        defaultClient: {
          config: {} as { aadTokenCredential: unknown },
          trackEvent: mockTrackEvent,
          trackException: mockTrackException,
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const telemetry = require('../utils/telemetry');
    ({ trackEvent, trackException } = telemetry);

    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    delete process.env.AZURE_CLIENT_ID;
  });

  describe('trackEvent', () => {
    describe('when APPLICATIONINSIGHTS_CONNECTION_STRING is not set', () => {
      it('does not call appInsights.setup', () => {
        trackEvent('test-event', { key: 'value' });

        expect(mockSetup).not.toHaveBeenCalled();
      });

      it('does not call client.trackEvent', () => {
        trackEvent('test-event', { key: 'value' });

        expect(mockTrackEvent).not.toHaveBeenCalled();
      });
    });

    describe('when APPLICATIONINSIGHTS_CONNECTION_STRING is set', () => {
      beforeEach(() => {
        process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = connectionString;
      });

      it('calls appInsights.setup with the connection string', () => {
        trackEvent('test-event', { key: 'value' });

        expect(mockSetup).toHaveBeenCalledWith(connectionString);
      });

      it('calls start on the setup result', () => {
        trackEvent('test-event', { key: 'value' });

        expect(mockStart).toHaveBeenCalled();
      });

      it('sets aadTokenCredential to a DefaultAzureCredential instance', () => {
        trackEvent('test-event', { key: 'value' });

        expect(MockDefaultAzureCredential).toHaveBeenCalledTimes(1);
      });

      it('passes AZURE_CLIENT_ID as managedIdentityClientId when set', () => {
        process.env.AZURE_CLIENT_ID = managedIdentityClientId;

        trackEvent('test-event', { key: 'value' });

        expect(MockDefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId });
      });

      it('passes undefined as managedIdentityClientId when AZURE_CLIENT_ID is not set', () => {
        trackEvent('test-event', { key: 'value' });

        expect(MockDefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId: undefined });
      });

      it('calls client.trackEvent with the name and properties', () => {
        const name = 'test-event';
        const properties = { key: 'value' };

        trackEvent(name, properties);

        expect(mockTrackEvent).toHaveBeenCalledWith({ name, properties });
      });
    });
  });

  describe('trackException', () => {
    describe('when APPLICATIONINSIGHTS_CONNECTION_STRING is not set', () => {
      it('does not call client.trackException', () => {
        trackException(new Error('test'), { key: 'value' });

        expect(mockTrackException).not.toHaveBeenCalled();
      });
    });

    describe('when APPLICATIONINSIGHTS_CONNECTION_STRING is set', () => {
      beforeEach(() => {
        process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = connectionString;
      });

      it('calls client.trackException with an Error instance and properties when given an Error', () => {
        const error = new Error('something went wrong');
        const properties = { key: 'value' };

        trackException(error, properties);

        expect(mockTrackException).toHaveBeenCalledWith({ exception: error, properties });
      });

      it('wraps a non-Error value in a new Error', () => {
        const properties = { key: 'value' };

        trackException('string error', properties);

        expect(mockTrackException).toHaveBeenCalledWith({
          exception: new Error('string error'),
          properties,
        });
      });

      it('wraps a non-Error object in a new Error using String()', () => {
        const properties = { key: 'value' };

        trackException({ code: 500 }, properties);

        expect(mockTrackException).toHaveBeenCalledWith({
          exception: new Error('[object Object]'),
          properties,
        });
      });
    });
  });
});
