import { hasObligationsWithMaturityDateFollowingFacility } from '.';

describe('modules/gift/helpers/has-obligations-with-maturity-date-following-facility', () => {
  it('should return false when obligations is undefined', () => {
    // Act
    const result = hasObligationsWithMaturityDateFollowingFacility(undefined);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when obligations is empty', () => {
    // Act
    const result = hasObligationsWithMaturityDateFollowingFacility([]);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when no obligation has maturityDateFollowsFacility set to true', () => {
    // Arrange
    const obligations = [{ maturityDateFollowsFacility: false }, { maturityDateFollowsFacility: undefined }];

    // Act
    const result = hasObligationsWithMaturityDateFollowingFacility(obligations);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when any obligation has maturityDateFollowsFacility set to true', () => {
    // Arrange
    const obligations = [{ maturityDateFollowsFacility: false }, { maturityDateFollowsFacility: true }];

    // Act
    const result = hasObligationsWithMaturityDateFollowingFacility(obligations);

    // Assert
    expect(result).toBe(true);
  });
});
