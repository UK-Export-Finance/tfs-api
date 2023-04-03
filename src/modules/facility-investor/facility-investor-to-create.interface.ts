import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export interface FacilityInvestorToCreate {
  facilityIdentifier: string;
  effectiveDate: DateOnlyString;
  guaranteeExpiryDate: DateOnlyString;
  lenderType?: string;
  currency: string;
  maximumLiability: number;
}
