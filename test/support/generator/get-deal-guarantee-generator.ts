import { AcbsGetDealGuaranteeResponseDto } from '@ukef/modules/acbs/dto/acbs-get-deal-guarantee-response.dto';
import { GetDealGuaranteeResponseItem } from '@ukef/modules/deal-guarantee/dto/get-deal-guarantee-response.dto';

import { AbstractGenerator } from './abstract-generator';

export class GetDealGuaranteeGenerator extends AbstractGenerator<GetDealGuaranteeResponseItem, GenerateResult, GenerateOptions> {
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

  protected transformRawValuesToGeneratedValues(
    values: GetDealGuaranteeResponseItem[],
    { dealIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const dealGuaranteesInAcbs: AcbsGetDealGuaranteeResponseDto[] = values.map((v) => ({
      EffectiveDate: v.effectiveDate,
      GuarantorParty: { PartyIdentifier: v.guarantorParty },
      LimitKey: v.limitKey,
      ExpirationDate: v.guaranteeExpiryDate,
      GuaranteedLimit: v.maximumLiability,
      GuaranteeType: { GuaranteeTypeCode: v.guaranteeTypeCode },
    }));

    const dealGuaranteesFromService = values.map((v) => ({
      dealIdentifier: dealIdentifier,
      portfolioIdentifier: portfolioIdentifier,
      effectiveDate: v.effectiveDate,
      guarantorParty: v.guarantorParty,
      limitKey: v.limitKey,
      guaranteeExpiryDate: v.guaranteeExpiryDate,
      maximumLiability: v.maximumLiability,
      guaranteeTypeCode: v.guaranteeTypeCode,
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
