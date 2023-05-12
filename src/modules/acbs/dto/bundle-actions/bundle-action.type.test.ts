import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { BundleAction, isFacilityCodeValueTransaction, isLoanAdvanceTransaction, isNewLoanRequest } from './bundle-action.type';

const valueGenerator = new RandomValueGenerator();

[
  { type: 'FacilityCodeValueTransaction', typeGuard: isFacilityCodeValueTransaction },
  { type: 'LoanAdvanceTransaction', typeGuard: isLoanAdvanceTransaction },
  { type: 'NewLoanRequest', typeGuard: isNewLoanRequest },
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
