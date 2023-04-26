import { ENUMS } from '@ukef/constants';
import { AcbsGetFacilityCovenantsResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-covenants-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityCovenantsResponseDto } from '@ukef/modules/facility-covenant/dto/get-facility-covenants-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityCovenantGenerator extends AbstractGenerator<AcbsGetFacilityCovenantsResponseDto, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): AcbsGetFacilityCovenantsResponseDto {
    const possibleCovenantTypeCodes = Object.values(ENUMS.COVENANT_TYPE_CODES);

    return {
      FacilityIdentifier: this.valueGenerator.ukefId(),
      PortfolioIdentifier: this.valueGenerator.string(),
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

interface GenerateOptions {
  facilityIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityCovenantsInAcbs: AcbsGetFacilityCovenantsResponseDto[];
  facilityCovenantsFromApi: GetFacilityCovenantsResponseDto[];
}
