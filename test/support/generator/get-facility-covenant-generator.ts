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
    return {
      FacilityIdentifier: this.valueGenerator.ukefId(),
      PortfolioIdentifier: this.valueGenerator.string(),
      CovenantIdentifier: this.valueGenerator.stringOfNumericCharacters(),
      EffectiveDate: this.valueGenerator.dateTimeString(), // TO-DO: correct mistake in previous PR
      ExpirationDate: this.valueGenerator.dateTimeString(),
      TargetAmount: this.valueGenerator.nonnegativeFloat(),
      PledgeType: {
        PledgeTypeCode: this.valueGenerator.string(),
      },
      CovenantType: {
        CovenantTypeCode: ['43', '46', '47'][this.valueGenerator.integer({ min: 0, max: 2 })],
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
      facilityIdentifier: facilityIdentifier,
      portfolioIdentifier: portfolioIdentifier,
      maximumLiability: v.TargetAmount,
      currency: v.PledgeType.PledgeTypeCode,
      guaranteeCommencementDate: this.dateStringTransformations.removeTimeIfExists(v.EffectiveDate),
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(v.EffectiveDate),
      guaranteeExpiryDate: this.dateStringTransformations.removeTimeIfExists(v.ExpirationDate),
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
