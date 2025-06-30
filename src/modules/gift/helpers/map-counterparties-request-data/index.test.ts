import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';

import { GiftFacilityCounterpartyRequestDto } from '../../dto';
import { mapCounterpartiesRequestData } from '.';

const mockCounterParty = GIFT_EXAMPLES.COUNTERPARTY();

delete mockCounterParty.sharePercentage;

describe('modules/gift/helpers/map-counterparties-request-data', () => {
  it('should return an array of counterparties with provided sharePercentage, otherwise null', () => {
    // Arrange
    const mockCounterparties: GiftFacilityCounterpartyRequestDto[] = [
      {
        ...mockCounterParty,
        sharePercentage: 10,
      },
      mockCounterParty,
      {
        ...mockCounterParty,
        sharePercentage: 20,
      },
      mockCounterParty,
    ];

    // Act
    const result = mapCounterpartiesRequestData(mockCounterparties);

    // Assert
    const expected = [
      mockCounterparties[0],
      {
        ...mockCounterparties[1],
        sharePercentage: null,
      },
      mockCounterparties[2],
      {
        ...mockCounterparties[3],
        sharePercentage: null,
      },
    ];

    expect(result).toStrictEqual(expected);
  });
});
