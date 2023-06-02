import { BundleInformationType } from '@ukef/constants/enums/bundle-information-type';
import { AcbsPartyId, DateString, UkefId } from '@ukef/helpers';

export interface FacilityCodeValueTransaction {
  $type: BundleInformationType.FACILITY_CODE_VALUE_TRANSACTION;
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
