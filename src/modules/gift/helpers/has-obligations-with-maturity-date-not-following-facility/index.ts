type GiftFacilityObligation = {
  maturityDateFollowsFacility?: boolean;
};

/**
 * Checks whether any obligation in a facility has maturityDateFollowsFacility set to false.
 * @param {GiftFacilityObligation[]} obligations: Facility obligations.
 * @returns {boolean} True when at least one obligation does not follow the facility maturity date.
 */
export const hasObligationsWithMaturityDateNotFollowingFacility = (obligations: GiftFacilityObligation[]): boolean =>
  Array.isArray(obligations) && obligations.some(({ maturityDateFollowsFacility }) => maturityDateFollowsFacility === false);
