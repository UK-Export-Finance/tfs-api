import { AcbsPartyId, DateString } from '@ukef/helpers';

// TODO APIM-123: compare to create request
export interface AcbsUpdateFacilityGuaranteeRequest {
  GuarantorParty: { PartyIdentifier: AcbsPartyId };
  LimitKey: string;
  LimitType: { LimitTypeCode: string };
  LenderType: { LenderTypeCode: string };
  SectionIdentifier: string;
  GuaranteeType: { GuaranteeTypeCode: string };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  GuaranteedLimit: number;
  GuaranteedPercentage: number;
}
