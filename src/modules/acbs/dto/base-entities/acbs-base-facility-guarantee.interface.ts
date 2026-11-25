import { DateString } from '@ukef/helpers';

export type AcbsBaseFacilityGuarantee = {
  GuarantorParty: {
    PartyIdentifier: string;
  };
  LimitKey: string;
  LimitType: {
    LimitTypeCode: string;
  };
  LenderType: {
    LenderTypeCode: string;
  };
  SectionIdentifier: string;
  GuaranteeType: {
    GuaranteeTypeCode: string;
  };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  GuaranteedLimit: number;
  GuaranteedPercentage: number;
};
