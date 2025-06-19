import { SERVICE_NAME } from '@ukef/constants/gift/service-name.constant';

import { isSupportedServiceName } from '.';

describe('modules/gift/helpers/is-supported-service-name', () => {
  describe('when a service name is an empty string', () => {
    it('should return false', () => {
      // Act
      const result = isSupportedServiceName('');

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when a service name is NOT found in SERVICE_NAME constants', () => {
    it('should return false', () => {
      // Arrange
      const mockServiceName = 'MOCK SERVICE NAME';

      // Act
      const result = isSupportedServiceName(mockServiceName);

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when a service name is found in SERVICE_NAME constants', () => {
    it('should return true', () => {
      // Arrange
      const mockServiceName = SERVICE_NAME.DTFS;

      // Act
      const result = isSupportedServiceName(mockServiceName);

      // Asset
      expect(result).toBe(true);
    });
  });
});
