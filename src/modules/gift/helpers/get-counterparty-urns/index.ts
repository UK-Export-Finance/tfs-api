import { GiftFacilityCounterpartyDto } from '../../dto';

/**
 * Get all URNs from GIFT counterparties
 * @param {GiftFacilityCounterpartyDto[]} counterparties: All counterparties
 * @returns {string[]} All counterparties URNs
 */
export const getCounterpartyUrns = (counterparties?: GiftFacilityCounterpartyDto[]): string[] => {
  if (Array.isArray(counterparties)) {
    return Object.values(counterparties).map((counterparty) => counterparty.counterpartyUrn);
  }

  return [];
};
