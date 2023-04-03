import { AcbsGetDealGuaranteeResponseDto } from '@ukef/modules/acbs/dto/acbs-get-deal-guarantee-response.dto';
import { GetDealGuaranteeResponseItem } from '@ukef/modules/deal-guarantee/dto/get-deal-guarantee-response.dto';

import { AbstractGenerator } from './abstract-generator';

export class DealGuaranteeGenerator extends AbstractGenerator<GetDealGuaranteeResponseItem, GenerateResult, GenerateOptions> {
  protected generateValues(): GetDealGuaranteeResponseItem {
    return {
      effectiveDate: this.valueGenerator.dateOnlyString(),
      guarantorParty: this.valueGenerator.acbsPartyId(),
      limitKey: this.valueGenerator.acbsPartyId(),
      guaranteeExpiryDate: this.valueGenerator.dateOnlyString(),
      maximumLiability: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
      guaranteeTypeCode: this.valueGenerator.stringOfNumericCharacters({ length: 3 }),
    };
  }

  protected transformRawValuesToGeneratedValues(values: DealGuarantee[], { dealIdentifier, portfolioIdentifier }: GenerateOptions): GenerateResult {
    const dealGuaranteesInAcbs: AcbsGetDealGuaranteeResponseDto[] = values.map((v) => ({
      EffectiveDate: v.effectiveDate,
      ExpirationDate: v.expiryDate,
      IsExpirationDateMaximum: v.isExpiryDateMaximum,
      LenderType: { LenderTypeCode: v.lenderType.LenderTypeCode },
      LimitAmount: v.maximumLiability,
    }));

    const dealGuaranteesFromService = values.map((v) => ({
      dealIdentifier: dealIdentifier,
      portfolioIdentifier: portfolioIdentifier,
      lenderType: { LenderTypeCode: v.lenderType.LenderTypeCode },
      effectiveDate: v.effectiveDate,
      expiryDate: v.expiryDate,
      isExpiryDateMaximum: v.isExpiryDateMaximum,
      maximumLiability: v.maximumLiability,
    }));

    return {
      dealGuaranteesInAcbs,
      dealGuaranteesFromService,
    };
  }
}
interface GenerateOptions {
  dealIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  dealGuaranteesInAcbs: AcbsGetDealGuaranteeResponseDto[];
  dealGuaranteesFromService: GetDealGuaranteeResponseItem[];
}
