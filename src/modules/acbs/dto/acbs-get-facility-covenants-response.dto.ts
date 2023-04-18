import { DateString } from '@ukef/helpers';

export interface AcbsGetFacilityCovenantsResponseDto {
  FacilityIdentifier: string;
  PortfolioIdentifier: string;
  CovenantIdentifier: string;
  EffectiveDate: DateString | null;
  ExpirationDate: DateString | null;
  TargetAmount: number;
  PledgeType: {
    PledgeTypeCode: string;
  };
  CovenantType: {
    CovenantTypeCode: string;
  };
}
