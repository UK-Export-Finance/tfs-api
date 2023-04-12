import { AcbsPartyId, DateOnlyString } from '@ukef/helpers';

/**
 * This is not full ACBS response
 */
export interface AcbsGetDealGuaranteeResponseDto {
  LimitKey: AcbsPartyId;
  GuarantorParty: {
    PartyIdentifier: AcbsPartyId;
  };
  GuaranteeType: {
    GuaranteeTypeCode: string;
  };
  EffectiveDate: DateOnlyString;
  ExpirationDate: DateOnlyString;
  GuaranteedLimit: number;
  // GuaranteedPercentage: number;
}
