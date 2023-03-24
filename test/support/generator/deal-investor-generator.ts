import { AcbsGetDealPartyResponseDto } from '@ukef/modules/acbs/dto/acbs-get-deal-party-response.dto';
import { DealInvestor } from '@ukef/modules/deal-investor/deal-investor.interface';

import { AbstractGenerator } from './abstract-generator';

export class DealInvestorGenerator extends AbstractGenerator<DealInvestor, GenerateResult, GenerateOptions> {
  protected generateValues(): DealInvestor {
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

  protected transformRawValuesToGeneratedValues(values: DealInvestor[], { dealIdentifier, portfolioIdentifier }: GenerateOptions): GenerateResult {
    const dealInvestorsInAcbs: AcbsGetDealPartyResponseDto[] = values.map((v) => ({
      EffectiveDate: v.effectiveDate,
      ExpirationDate: v.expiryDate,
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
  dealInvestorsFromService: DealInvestor[];
}
