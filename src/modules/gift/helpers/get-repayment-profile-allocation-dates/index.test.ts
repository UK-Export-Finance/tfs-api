import { EXAMPLES } from '@ukef/constants';

import { GiftRepaymentProfileDto } from '../../dto';
import { getRepaymentProfileAllocationDates } from '.';

const {
  GIFT: { REPAYMENT_PROFILE },
} = EXAMPLES;

const mockRepaymentProfiles: GiftRepaymentProfileDto[] = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

describe('modules/gift/helpers/get-repayment-profile-allocation-dates', () => {
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
