import { hasObligationsWithMaturityDateNotFollowingFacility } from '.';

describe('modules/gift/helpers/has-obligations-with-maturity-date-not-following-facility', () => {
  it('should return false when obligations is undefined', () => {
    // Act
    const result = hasObligationsWithMaturityDateNotFollowingFacility(undefined);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when obligations is empty', () => {
    // Act
    const result = hasObligationsWithMaturityDateNotFollowingFacility([]);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when no obligation has maturityDateFollowsFacility set to false', () => {
    // Arrange
    const obligations = [{ maturityDateFollowsFacility: true }, { maturityDateFollowsFacility: undefined }];

    // Act
    const result = hasObligationsWithMaturityDateNotFollowingFacility(obligations);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when any obligation has maturityDateFollowsFacility set to false', () => {
    // Arrange
    const obligations = [{ maturityDateFollowsFacility: false }, { maturityDateFollowsFacility: true }];

    // Act
    const result = hasObligationsWithMaturityDateNotFollowingFacility(obligations);

    // Assert
    expect(result).toBe(true);
  });
});
