import { EXAMPLES } from '@ukef/constants';

import { GiftRepaymentProfileDto } from '../../dto';
import { getRepaymentProfileAllocationDates } from '.';

const {
  GIFT: { REPAYMENT_PROFILE },
} = EXAMPLES;

const mockRepaymentProfiles: GiftRepaymentProfileDto[] = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

describe('modules/gift/helpers/get-repayment-profile-allocation-dates', () => {
  describe('when repayment profiles are provided', () => {
    it('should return a single array of all allocation dueDate values', () => {
      const result = getRepaymentProfileAllocationDates(mockRepaymentProfiles);

      const expected = [
        mockRepaymentProfiles[0].allocations[0].dueDate,
        mockRepaymentProfiles[0].allocations[1].dueDate,
        mockRepaymentProfiles[1].allocations[0].dueDate,
        mockRepaymentProfiles[1].allocations[1].dueDate,
        mockRepaymentProfiles[2].allocations[0].dueDate,
        mockRepaymentProfiles[2].allocations[1].dueDate,
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when repayment profiles are NOT provided', () => {
    it('should return an empty array', () => {
      const result = getRepaymentProfileAllocationDates(mockRepaymentProfiles);

      expect(result).toStrictEqual([]);
    });
  });
});
