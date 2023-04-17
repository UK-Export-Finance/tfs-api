import { DateOnlyString } from '@ukef/helpers';

export interface FacilityGuarantee {
  facilityIdentifier: string;
  portfolioIdentifier: string;
  guaranteeCommencementDate: DateOnlyString;
  effectiveDate: DateOnlyString;
  guarantorParty: string;
  limitKey: string;
  guaranteeExpiryDate: DateOnlyString;
  maximumLiability: number;
  guaranteeTypeCode: string;
}
