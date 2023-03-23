import { DateString } from '@ukef/helpers/date-string.type';

export interface AcbsCreateDealGuaranteeDto {
  LenderType: {
    LenderTypeCode: string;
  };
  SectionIdentifier: string;
  LimitType: {
    LimitTypeCode: string;
  };
  LimitKey: string;
  GuarantorParty: {
    PartyIdentifier: string;
  };
  GuaranteeType: {
    GuaranteeTypeCode: string;
  };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  GuaranteedLimit: number;
  GuaranteedPercentage: number;
}
