import { AcbsPartyId, DateString } from '@ukef/helpers';

export type AcbsGetDealGuaranteeResponseDto = {
  LimitKey: AcbsPartyId;
  GuarantorParty: {
    PartyIdentifier: AcbsPartyId;
  };
  GuaranteeType: {
    GuaranteeTypeCode: string;
  };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  GuaranteedLimit: number;
};
