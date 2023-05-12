import { DateOnlyString, UkefId } from '@ukef/helpers';

export interface FacilityLoanToCreate {
  postingDate: DateOnlyString;
  facilityIdentifier: UkefId;
  borrowerPartyIdentifier: string;
  productTypeId: string;
  productTypeGroup: string;
  currency: string;
  dealCustomerUsageRate?: number;
  dealCustomerUsageOperationType?: string;
  amount: number;
  issueDate: DateOnlyString;
  expiryDate: DateOnlyString;
}
