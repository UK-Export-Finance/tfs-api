import { DateString } from '@ukef/helpers';

export interface AcbsGetFacilityCovenantsResponseDto {
  FacilityIdentifier: string;
  PortfolioIdentifier: string;
  CovenantIdentifier: string;
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  TargetAmount: number;
  PledgeType: {
    PledgeTypeCode: string;
  };
  CovenantType: {
    CovenantTypeCode: string;
  };
}
