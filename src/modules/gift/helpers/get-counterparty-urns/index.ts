import { GiftFacilityCounterpartyRequestDto } from '../../dto';

/**
 * Get all URNs from GIFT counterparties
 * @param {GiftFacilityCounterpartyRequestDto[]} counterparties: All counterparties
 * @returns {string[]} All counterparties URNs
 */
export const getCounterpartyUrns = (counterparties?: GiftFacilityCounterpartyRequestDto[]): string[] => {
  if (Array.isArray(counterparties)) {
    return Object.values(counterparties).map((counterparty) => counterparty.counterpartyUrn);
  }

  return [];
};
