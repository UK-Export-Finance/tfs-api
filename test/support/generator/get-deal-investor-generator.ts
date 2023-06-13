import { AcbsGetDealPartyResponseDto } from '@ukef/modules/acbs/dto/acbs-get-deal-party-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetDealInvestorResponseDto } from '@ukef/modules/deal-investor/dto/deal-investor-response.dto';

import { AbstractGenerator } from './abstract-generator';

export class GetDealInvestorGenerator extends AbstractGenerator<GetDealInvestorResponseDto, GenerateResult, GenerateOptions> {
  dateStringTransformations = new DateStringTransformations();

  protected generateValues(): GetDealInvestorResponseDto {
    return {
      dealIdentifier: this.valueGenerator.ukefId(),
      portfolioIdentifier: this.valueGenerator.string(),
      lenderType: { LenderTypeCode: this.valueGenerator.string() },
      effectiveDate: this.valueGenerator.dateOnlyString(),
      expiryDate: this.valueGenerator.dateOnlyString(),
      isExpiryDateMaximum: this.valueGenerator.boolean(),
      maximumLiability: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: GetDealInvestorResponseDto[],
    { dealIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const dealInvestorsInAcbs: AcbsGetDealPartyResponseDto[] = values.map((v) => ({
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(v.effectiveDate),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(v.expiryDate),
      IsExpirationDateMaximum: v.isExpiryDateMaximum,
      LenderType: { LenderTypeCode: v.lenderType.LenderTypeCode },
      LimitAmount: v.maximumLiability,
    }));

    const dealInvestorsFromService = values.map((v) => ({
      dealIdentifier: dealIdentifier,
      portfolioIdentifier: portfolioIdentifier,
      lenderType: { LenderTypeCode: v.lenderType.LenderTypeCode },
      effectiveDate: v.effectiveDate,
      expiryDate: v.expiryDate,
      isExpiryDateMaximum: v.isExpiryDateMaximum,
      maximumLiability: v.maximumLiability,
    }));

    return {
      dealInvestorsInAcbs,
      dealInvestorsFromService,
    };
  }
}
interface GenerateOptions {
  dealIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  dealInvestorsInAcbs: AcbsGetDealPartyResponseDto[];
  dealInvestorsFromService: GetDealInvestorResponseDto[];
}
