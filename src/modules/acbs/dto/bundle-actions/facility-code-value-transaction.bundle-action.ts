import { AcbsPartyId, DateString, UkefId } from '@ukef/helpers';

export interface FacilityCodeValueTransaction {
  $type: 'FacilityCodeValueTransaction';
  AccountOwnerIdentifier: AcbsPartyId;
  EffectiveDate: DateString;
  FacilityIdentifier: UkefId;
  FacilityTransactionCodeValue: {
    FacilityTransactionCodeValueCode: string;
  };
  FacilityTransactionType: {
    TypeCode: string;
  };
  IsDraftIndicator: boolean;
  LenderType: {
    LenderTypeCode: string;
  };
  LimitKeyValue: AcbsPartyId;
  LimitType: {
    LimitTypeCode: string;
  };
  SectionIdentifier: string;
}
