import { EXAMPLES } from '@ukef/constants';

import { GiftFacilityCounterpartyDto } from '../../dto';
import { getCounterpartyUrns } from '.';

const {
  GIFT: { COUNTERPARTY },
} = EXAMPLES;

const mockCounterparties: GiftFacilityCounterpartyDto[] = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];

describe('modules/gift/helpers/get-counterparty-urns', () => {
  describe('when counterparties are provided', () => {
    it('should return an array of all counterparty URNs', () => {
      // Act
      const result = getCounterpartyUrns(mockCounterparties);

      // Assert
      const expected = [mockCounterparties[0].counterpartyUrn, mockCounterparties[1].counterpartyUrn, mockCounterparties[2].counterpartyUrn];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when counterparties is an empty array', () => {
    it('should return an empty array', () => {
      // Act
      const result = getCounterpartyUrns([]);

      // Assert
      expect(result).toStrictEqual([]);
    });
  });

  describe('when counterparties are NOT provided', () => {
    it('should return an empty array', () => {
      // Act
      const result = getCounterpartyUrns();

      // Assert
      expect(result).toStrictEqual([]);
    });
  });
});
