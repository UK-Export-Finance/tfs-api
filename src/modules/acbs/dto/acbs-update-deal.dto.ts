import { DateString } from '@ukef/helpers/date-string.type';

export interface AcbsUpdateDealDto {
  DealIdentifier: string;
  DealOrigination: {
    DealOriginationCode: string;
  };
  DealType: {
    DealTypeCode: string;
  };
  Currency: {
    CurrencyCode: string;
    IsActiveIndicator: boolean;
  };
  OriginalEffectiveDate: DateString;
  OriginalApprovalDate: DateString;
  CurrentOfficer: {
    LineOfficerIdentifier: string;
  };
  GeneralLedgerUnit: {
    GeneralLedgerUnitIdentifier: string;
  };
  ServicingUnit: {
    ServicingUnitIdentifier: string;
  };
  ServicingUnitSection: {
    ServicingUnitSectionIdentifier: string;
  };

  BookingDate: DateString | null;
  FinalAvailableDate: DateString | null;
  IsFinalAvailableDateMaximum: boolean;
  ExpirationDate: DateString | null;
  IsExpirationDateMaximum: boolean;
  WithheldAmount: number;
  MemoLimitAmount: number;
  BookingClass: {
    BookingClassCode: string;
  };
  TargetClosingDate: DateString;
  MemoUsedAmount: number;
  MemoAvailableAmount: number;
  MemoWithheldAmount: number;
  IndustryClassification: {
    IndustryClassificationCode: string;
  };
  CapitalClass: {
    CapitalClassCode: string;
  };
  AccountStructure: {
    AccountStructureCode: string;
  };
  BorrowerParty: {
    PartyIdentifier: string;
  };
  LimitAmount: number;
}
