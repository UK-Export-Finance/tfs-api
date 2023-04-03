import { AcbsPartyId, DateString } from '@ukef/helpers';

/**
 * This is not full ACBS response
 */
export interface AcbsGetDealGuaranteeResponseDto {
  LenderType: {
    LenderTypeCode: string;
  };
  SectionIdentifier: string;
  LimitType: {
    LimitTypeCode: string;
  };
  LimitKey: string;
  GuarantorParty: {
    PartyIdentifier: AcbsPartyId;
  };
  GuaranteeType: {
    GuaranteeTypeCode: AcbsPartyId;
  };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  GuaranteedLimit: number;
  GuaranteedPercentage: number;
}
