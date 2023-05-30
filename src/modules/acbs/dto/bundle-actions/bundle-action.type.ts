import { PROPERTIES } from '@ukef/constants';

import { FacilityCodeValueTransaction } from './facility-code-value-transaction.bundle-action';
import { FacilityFeeAmountTransaction } from './facility-fee-amount-transaction.bundle-action';
import { LoanAdvanceTransaction } from './loan-advance-transaction.bundle-action';
import { NewLoanRequest } from './new-loan-request.bundle-action';

export type BundleAction = FacilityCodeValueTransaction | LoanAdvanceTransaction | NewLoanRequest | FacilityFeeAmountTransaction | { $type: string };

export const isFacilityCodeValueTransaction = (action: BundleAction): action is FacilityCodeValueTransaction => {
  return action.$type === 'FacilityCodeValueTransaction';
};

export const isLoanAdvanceTransaction = (action: BundleAction): action is LoanAdvanceTransaction => {
  return action.$type === 'LoanAdvanceTransaction';
};

export const isNewLoanRequest = (bundleAction: BundleAction): bundleAction is NewLoanRequest => {
  return bundleAction.$type === PROPERTIES.FACILITY_LOAN.DEFAULT.messageType;
};

export const isFacilityFeeAmountTransaction = (bundleAction: BundleAction): bundleAction is FacilityFeeAmountTransaction => {
  return bundleAction.$type === PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.bundleMessageList.type;
};
