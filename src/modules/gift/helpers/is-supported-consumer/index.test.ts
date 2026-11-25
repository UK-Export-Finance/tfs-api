import { CONSUMER } from '@ukef/constants/gift/consumer.constant';

import { isSupportedConsumer } from '.';

describe('modules/gift/helpers/is-supported-consumer', () => {
  describe('when a consumer is an empty string', () => {
    it('should return false', () => {
      // Act
      const result = isSupportedConsumer('');

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when a consumer is NOT found in CONSUMER constants', () => {
    it('should return false', () => {
      // Arrange
      const mockConsumer = 'MOCK CONSUMER';

      // Act
      const result = isSupportedConsumer(mockConsumer);

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when a consumer is found in CONSUMER constants', () => {
    it('should return true', () => {
      // Arrange
      const mockConsumer = CONSUMER.DTFS;

      // Act
      const result = isSupportedConsumer(mockConsumer);

      // Asset
      expect(result).toBe(true);
    });
  });
});
