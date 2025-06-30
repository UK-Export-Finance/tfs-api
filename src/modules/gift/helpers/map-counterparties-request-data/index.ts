import { GiftFacilityCounterpartyRequestDto } from '../../dto';

/**
 * Map counterparties request data into a structure required to be sent to GIFT.
 * sharePercentage is a conditional field.
 * However, GIFT validation dictates that if sharePercentage is NOT required, it should be sent as null.
 * @param {GiftFacilityCounterpartyRequestDto[]} counterparties: Counterparties data
 * @returns {GiftFacilityCounterpartyRequestDto[]}
 */
export const mapCounterpartiesRequestData = (counterparties: GiftFacilityCounterpartyRequestDto[]) =>
  counterparties.map((counterparty) => ({
    ...counterparty,
    sharePercentage: counterparty.sharePercentage || null,
  }));
