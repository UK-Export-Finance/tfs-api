import { DateString } from '@ukef/helpers';

export interface AcbsGetFacilityCovenantsResponseDto {
  FacilityIdentifier: string;
  PortfolioIdentifier: string;
  AccountOwnerIdentifier: string;
  ComplianceEvaluationMode: {
    CovenantEvaluationModeCode: string;
  };
  ComplianceStatusDate: DateString;
  CovenantIdentifier: string;
  CovenantName: string;
  DateCycleEvaluationMode: {
    CovenantEvaluationModeCode: string;
  };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  LenderType: {
    LenderTypeCode: string;
  };
  LimitKeyValue: string;
  LimitType: {
    LimitTypeCode: string;
  };
  SectionIdentifier: string;
  TargetAmount: number;
  PledgeType: {
    PledgeTypeCode: string;
  };
  CovenantType: {
    CovenantTypeCode: string;
  };
  ComplianceRule: {
    ComplianceRuleCode: string;
  };
  InComplianceIndicator: boolean;
  WaivedIndicator: boolean;
  NextReviewDate: DateString;
}
