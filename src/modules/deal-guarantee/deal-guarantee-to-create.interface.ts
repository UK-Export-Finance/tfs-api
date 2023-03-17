import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export interface DealGuaranteeToCreate {
  dealIdentifier: string;
  effectiveDate: DateOnlyString;
  guarantorParty?: string;
  limitKey: string;
  guaranteeExpiryDate: DateOnlyString;
  maximumLiability: number;
  guaranteeTypeCode?: string;
}
