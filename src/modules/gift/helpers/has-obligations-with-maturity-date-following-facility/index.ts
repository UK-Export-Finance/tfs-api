type GiftFacilityObligation = {
  maturityDateFollowsFacility?: boolean;
};

/**
 * Checks whether any obligation in a facility has maturityDateFollowsFacility set to true.
 * @param {GiftFacilityObligation[]} obligations: Facility obligations.
 * @returns {boolean} True when at least one obligation follows the facility maturity date.
 */
export const hasObligationsWithMaturityDateFollowingFacility = (obligations: GiftFacilityObligation[]): boolean =>
  Array.isArray(obligations) && obligations.some(({ maturityDateFollowsFacility }) => maturityDateFollowsFacility === true);
