import { EXAMPLES } from '@ukef/constants';

import { GiftRepaymentProfileDto } from '../../dto';
import { getRepaymentProfileNames } from '.';

const {
  GIFT: { REPAYMENT_PROFILE },
} = EXAMPLES;

const mockRepaymentProfiles: GiftRepaymentProfileDto[] = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

describe('modules/gift/helpers/get-repayment-profile-names', () => {
  describe('when repayment profiles are provided', () => {
    it('should return an array of all repayment profile name values', () => {
      const result = getRepaymentProfileNames(mockRepaymentProfiles);

      const expected = [mockRepaymentProfiles[0].name, mockRepaymentProfiles[1].name, mockRepaymentProfiles[2].name];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when repayment profiles is an empty array', () => {
    it('should return an empty array', () => {
      const result = getRepaymentProfileNames([]);

      expect(result).toStrictEqual([]);
    });
  });

  describe('when repayment profiles are NOT provided', () => {
    it('should return an empty array', () => {
      const result = getRepaymentProfileNames();

      expect(result).toStrictEqual([]);
    });
  });
});
