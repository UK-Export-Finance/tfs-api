import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import giftQueueConfig from './gift-queue.config';

describe('giftQueueConfig', () => {
  const valueGenerator = new RandomValueGenerator();

  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('connectionString', () => {
    it('is the env variable GIFT_QUEUE_STORAGE_CONNECTION_STRING', () => {
      const environmentVariableValue = valueGenerator.string();

      process.env = {
        GIFT_QUEUE_STORAGE_CONNECTION_STRING: environmentVariableValue,
      };

      const { connectionString } = giftQueueConfig();

      expect(connectionString).toBe(environmentVariableValue);
    });
  });

  describe('clientId', () => {
    it('is the env variable AZURE_CLIENT_ID', () => {
      const environmentVariableValue = valueGenerator.string();

      process.env = {
        AZURE_CLIENT_ID: environmentVariableValue,
      };

      const { clientId } = giftQueueConfig();

      expect(clientId).toBe(environmentVariableValue);
    });

    it('is undefined if AZURE_CLIENT_ID is not specified', () => {
      process.env = {};

      const { clientId } = giftQueueConfig();

      expect(clientId).toBeUndefined();
    });
  });

  describe('queueName', () => {
    it('is the env variable GIFT_QUEUE_NAME if specified', () => {
      const environmentVariableValue = valueGenerator.string();

      process.env = {
        GIFT_QUEUE_NAME: environmentVariableValue,
      };

      const { queueName } = giftQueueConfig();

      expect(queueName).toBe(environmentVariableValue);
    });

    it('is the default value gift-requests if GIFT_QUEUE_NAME is not specified', () => {
      process.env = {};

      const { queueName } = giftQueueConfig();

      expect(queueName).toBe('gift-requests');
    });
  });
});
