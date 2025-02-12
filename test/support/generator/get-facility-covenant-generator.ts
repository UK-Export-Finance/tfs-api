import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateString } from '@ukef/helpers';
import { AcbsGetFacilityCovenantsResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-covenants-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityCovenantsResponseDto } from '@ukef/modules/facility-covenant/dto/get-facility-covenants-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityCovenantGenerator extends AbstractGenerator<CovenantValues, GenerateResult, GenerateOptions> {
  constructor(
    protected readonly valueGenerator: RandomValueGenerator,
    protected readonly dateStringTransformations: DateStringTransformations,
  ) {
    super(valueGenerator);
  }

  protected generateValues(): CovenantValues {
    const possibleCovenantTypeCodes = Object.values(ENUMS.COVENANT_TYPE_CODES);

    return {
      CovenantIdentifier: this.valueGenerator.stringOfNumericCharacters(),
      EffectiveDate: this.valueGenerator.dateTimeString(),
      ExpirationDate: this.valueGenerator.dateTimeString(),
      TargetAmount: this.valueGenerator.nonnegativeFloat(),
      PledgeType: {
        PledgeTypeCode: this.valueGenerator.string(),
      },
      CovenantType: {
        CovenantTypeCode: possibleCovenantTypeCodes[this.valueGenerator.integer({ min: 0, max: possibleCovenantTypeCodes.length - 1 })],
      },
      CovenantName: this.valueGenerator.string(),
      LimitKeyValue: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: AcbsGetFacilityCovenantsResponseDto[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityCovenantsInAcbs: AcbsGetFacilityCovenantsResponseDto[] = values.map((v) => ({
      FacilityIdentifier: facilityIdentifier,
      PortfolioIdentifier: portfolioIdentifier,
      CovenantIdentifier: v.CovenantIdentifier,
      EffectiveDate: v.EffectiveDate,
      ExpirationDate: v.ExpirationDate,
      TargetAmount: v.TargetAmount,
      PledgeType: {
        PledgeTypeCode: v.PledgeType.PledgeTypeCode,
      },
      CovenantType: {
        CovenantTypeCode: v.CovenantType.CovenantTypeCode,
      },
      AccountOwnerIdentifier: PROPERTIES.COVENANT.DEFAULT.accountOwnerIdentifier,
      ComplianceEvaluationMode: {
        CovenantEvaluationModeCode: PROPERTIES.COVENANT.DEFAULT.complianceEvaluationMode.covenantEvaluationModeCode,
      },
      ComplianceStatusDate: v.EffectiveDate,
      CovenantName: v.CovenantName,
      DateCycleEvaluationMode: {
        CovenantEvaluationModeCode: PROPERTIES.COVENANT.DEFAULT.dateCycleEvaluationMode.covenantEvaluationModeCode,
      },
      LenderType: {
        LenderTypeCode: PROPERTIES.COVENANT.DEFAULT.lenderType.covenantLenderTypeCode,
      },
      LimitKeyValue: v.LimitKeyValue,
      LimitType: {
        LimitTypeCode: PROPERTIES.COVENANT.DEFAULT.limitType.covenantLimitTypeCode,
      },
      SectionIdentifier: PROPERTIES.COVENANT.DEFAULT.sectionIdentifier,
      ComplianceRule: {
        ComplianceRuleCode: PROPERTIES.COVENANT.DEFAULT.complianceRule.covenantComplianceRuleCode,
      },
      InComplianceIndicator: PROPERTIES.COVENANT.DEFAULT.inComplianceIndicator,
      WaivedIndicator: PROPERTIES.COVENANT.DEFAULT.waivedIndicator,
      NextReviewDate: v.EffectiveDate,
    }));

    const facilityCovenantsFromApi: GetFacilityCovenantsResponseDto[] = values.map((v) => ({
      covenantIdentifier: v.CovenantIdentifier,
      covenantType: v.CovenantType.CovenantTypeCode,
      facilityIdentifier,
      portfolioIdentifier,
      maximumLiability: v.TargetAmount,
      currency: v.PledgeType.PledgeTypeCode,
      guaranteeCommencementDate: this.dateStringTransformations.removeTime(v.EffectiveDate),
      effectiveDate: this.dateStringTransformations.removeTime(v.EffectiveDate),
      guaranteeExpiryDate: this.dateStringTransformations.removeTime(v.ExpirationDate),
    }));

    return {
      facilityCovenantsInAcbs,
      facilityCovenantsFromApi,
    };
  }
}

interface CovenantValues {
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
  CovenantName: string;
  LimitKeyValue: string;
}

interface GenerateOptions {
  facilityIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityCovenantsInAcbs: AcbsGetFacilityCovenantsResponseDto[];
  facilityCovenantsFromApi: GetFacilityCovenantsResponseDto[];
}
