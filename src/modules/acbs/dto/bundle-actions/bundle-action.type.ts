import { ENUMS } from '@ukef/constants';
import { FacilityAmountTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-amount-transaction.bundle-action';
import { FacilityCodeValueTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-code-value-transaction.bundle-action';
import { LoanAdvanceTransaction } from '@ukef/modules/acbs/dto/bundle-actions/loan-advance-transaction.bundle-action';
import { NewLoanRequest } from '@ukef/modules/acbs/dto/bundle-actions/new-loan-request.bundle-action';

export type BundleAction = FacilityCodeValueTransaction | FacilityAmountTransaction | LoanAdvanceTransaction | NewLoanRequest | { $type: string };

export const isFacilityCodeValueTransaction = (action: BundleAction): action is FacilityCodeValueTransaction => {
  return action.$type === ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_CODE_VALUE_TRANSACTION;
};

export const isFacilityAmountTransaction = (action: BundleAction): action is FacilityAmountTransaction => {
  return action.$type === ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_AMOUNT_TRANSACTION;
};

export const isLoanAdvanceTransaction = (action: BundleAction): action is LoanAdvanceTransaction => {
  return action.$type === ENUMS.BUNDLE_INFORMATION_TYPES.LOAN_ADVANCE_TRANSACTION;
};

export const isNewLoanRequest = (bundleAction: BundleAction): bundleAction is NewLoanRequest => {
  return bundleAction.$type === ENUMS.BUNDLE_INFORMATION_TYPES.NEW_LOAN_REQUEST;
};
