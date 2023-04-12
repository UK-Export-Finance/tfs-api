import { DateString } from '@ukef/helpers';

export type AcbsGetFacilityGuaranteesResponseDto = AcbsGetFacilityGuaranteeDto[];

export interface AcbsGetFacilityGuaranteeDto {
  EffectiveDate: DateString;
  GuarantorParty: {
    PartyIdentifier: string;
  };
  LimitKey: string;
  ExpirationDate: DateString;
  GuaranteedLimit: number;
  GuaranteeType: {
    GuaranteeTypeCode: string;
  };
}
