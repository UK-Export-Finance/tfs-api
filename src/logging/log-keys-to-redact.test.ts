import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { buildKeyToRedact } from './build-key-to-redact';
import { logKeysToRedact, LogKeysToRedactOptions } from './log-keys-to-redact';

describe('logKeysToRedact', () => {
  const valueGenerator = new RandomValueGenerator();
  const options: Omit<LogKeysToRedactOptions, 'redactLogs'> = {
    clientRequest: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
    },
    outgoingRequest: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
      bodyLogKey: valueGenerator.string(),
      sensitiveBodyFields: [valueGenerator.string(), valueGenerator.string()],
    },
    incomingResponse: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
      sensitiveHeaders: [valueGenerator.string(), valueGenerator.string()],
      bodyLogKey: valueGenerator.string(),
      sensitiveBodyFields: [valueGenerator.string(), valueGenerator.string()],
    },
    error: {
      logKey: valueGenerator.string(),
      sensitiveChildKeys: [valueGenerator.string(), valueGenerator.string()],
    },
  };

  describe('when redactLogs is false', () => {
    it('returns an empty array', () => {
      expect(logKeysToRedact({ redactLogs: false, ...options })).toStrictEqual([]);
    });
  });

  describe('when redactLogs is true', () => {
    let result: string[];

    beforeEach(() => {
      result = logKeysToRedact({ redactLogs: true, ...options });
    });

    it('includes the headers of a client request', () => {
      const { logKey, headersLogKey } = options.clientRequest;

      expect(result).toContain(buildKeyToRedact([logKey, headersLogKey]));
    });

    it('includes the headers of an outgoing request', () => {
      const { logKey, headersLogKey } = options.outgoingRequest;

      expect(result).toContain(buildKeyToRedact([logKey, headersLogKey]));
    });

    it('includes all sensitive body fields of an outgoing request', () => {
      const { logKey, bodyLogKey, sensitiveBodyFields } = options.outgoingRequest;

      expect(result).toContain(buildKeyToRedact([logKey, bodyLogKey, sensitiveBodyFields[0]]));
      expect(result).toContain(buildKeyToRedact([logKey, bodyLogKey, sensitiveBodyFields[1]]));
    });

    it('includes all sensitive headers of an incoming response', () => {
      const { logKey, headersLogKey, sensitiveHeaders } = options.incomingResponse;

      expect(result).toContain(buildKeyToRedact([logKey, headersLogKey, sensitiveHeaders[0]]));
      expect(result).toContain(buildKeyToRedact([logKey, headersLogKey, sensitiveHeaders[1]]));
    });

    it('includes all sensitive body fields of an incoming response', () => {
      const { logKey, bodyLogKey, sensitiveBodyFields } = options.incomingResponse;

      expect(result).toContain(buildKeyToRedact([logKey, bodyLogKey, sensitiveBodyFields[0]]));
      expect(result).toContain(buildKeyToRedact([logKey, bodyLogKey, sensitiveBodyFields[1]]));
    });

    it('includes all sensitive child keys of an error', () => {
      const { logKey, sensitiveChildKeys } = options.error;

      expect(result).toContain(buildKeyToRedact([logKey, sensitiveChildKeys[0]]));
      expect(result).toContain(buildKeyToRedact([logKey, sensitiveChildKeys[1]]));
    });

    it('includes all sensitive child keys of an inner error', () => {
      const { logKey, sensitiveChildKeys } = options.error;

      expect(result).toContain(buildKeyToRedact([logKey, 'innerError', sensitiveChildKeys[0]]));
      expect(result).toContain(buildKeyToRedact([logKey, 'innerError', sensitiveChildKeys[1]]));
    });
  });
});
