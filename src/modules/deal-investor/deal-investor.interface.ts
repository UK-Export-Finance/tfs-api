import { DateString } from '@ukef/helpers/date-string.type';

export interface DealInvestor {
  dealIdentifier: string;
  portfolioIdentifier: string;
  lenderType: { LenderTypeCode: string };
  effectiveDate: DateString;
  expiryDate: DateString;
  isExpiryDateMaximum: boolean;
  maximumLiability: number;
}
