import { EXAMPLES } from '@ukef/constants';

import { GiftRepaymentProfileDto } from '../../dto';
import { getRepaymentProfileNames } from '.';

const {
  GIFT: { REPAYMENT_PROFILE },
} = EXAMPLES;

const mockRepaymentProfiles: GiftRepaymentProfileDto[] = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

describe('modules/gift/helpers/get-repayment-profile-names', () => {
  it('should return an array of all repayment profile name values', () => {
    const result = getRepaymentProfileNames(mockRepaymentProfiles);

    const expected = [mockRepaymentProfiles[0].name, mockRepaymentProfiles[1].name, mockRepaymentProfiles[2].name];

    expect(result).toStrictEqual(expected);
  });
});
