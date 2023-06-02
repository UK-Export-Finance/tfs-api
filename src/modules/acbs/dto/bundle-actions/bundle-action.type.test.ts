import { ENUMS } from '@ukef/constants';
import {
  BundleAction,
  isFacilityAmountTransaction,
  isFacilityCodeValueTransaction,
  isFacilityFeeAmountTransaction,
  isLoanAdvanceTransaction,
  isNewLoanRequest,
} from '@ukef/modules/acbs/dto/bundle-actions/bundle-action.type';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

const valueGenerator = new RandomValueGenerator();

[
  { type: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_CODE_VALUE_TRANSACTION, typeGuard: isFacilityCodeValueTransaction },
  { type: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_AMOUNT_TRANSACTION, typeGuard: isFacilityAmountTransaction },
  { type: ENUMS.BUNDLE_INFORMATION_TYPES.LOAN_ADVANCE_TRANSACTION, typeGuard: isLoanAdvanceTransaction },
  { type: ENUMS.BUNDLE_INFORMATION_TYPES.NEW_LOAN_REQUEST, typeGuard: isNewLoanRequest },
  { type: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_FEE_AMOUNT_TRANSACTION, typeGuard: isFacilityFeeAmountTransaction },
].forEach(({ type, typeGuard }) => {
  describe(`${typeGuard.name}`, () => {
    it(`returns true if $type is ${type}`, () => {
      const action = {
        $type: type,
      } as BundleAction;

      expect(typeGuard(action)).toBe(true);
    });

    it(`returns false if $type is not ${type}`, () => {
      const action = {
        $type: valueGenerator.string(),
      } as BundleAction;

      expect(typeGuard(action)).toBe(false);
    });
  });
});
