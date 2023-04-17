import { UkefId } from '@ukef/helpers';
import { AcbsGetFacilityPartyResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-party-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityInvestorResponseItem } from '@ukef/modules/facility-investor/dto/get-facility-investors-response.dto';

import { AbstractGenerator } from './abstract-generator';

export class GetFacilityInvestorGenerator extends AbstractGenerator<GetFacilityInvestorResponseItem, GenerateResult, GenerateOptions> {
  dateStringTransformations = new DateStringTransformations();

  protected generateValues(): GetFacilityInvestorResponseItem {
    const effectiveDate = this.valueGenerator.dateOnlyString();
    return {
      facilityIdentifier: this.valueGenerator.ukefId(),
      portfolioIdentifier: this.valueGenerator.string(),
      guaranteeCommencementDate: effectiveDate,
      effectiveDate: effectiveDate,
      currency: this.valueGenerator.string({ length: 3 }),
      guaranteeExpiryDate: this.valueGenerator.dateOnlyString(),
      maximumLiability: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
      lenderTypeCode: this.valueGenerator.string({ length: 3 }),
      involvedParty: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: GetFacilityInvestorResponseItem[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityInvestorsInAcbs: AcbsGetFacilityPartyResponseDto[] = values.map((v) => ({
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(v.effectiveDate),
      Currency: {
        CurrencyCode: v.currency,
      },
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(v.guaranteeExpiryDate),
      LimitAmount: v.maximumLiability,
      LenderType: {
        LenderTypeCode: v.lenderTypeCode,
      },
      InvolvedParty: {
        PartyIdentifier: v.involvedParty,
      },
    }));

    const facilityInvestorsFromService = values.map((v) => ({
      portfolioIdentifier: portfolioIdentifier,
      facilityIdentifier: facilityIdentifier,
      guaranteeCommencementDate: v.guaranteeCommencementDate,
      effectiveDate: v.effectiveDate,
      currency: v.currency,
      guaranteeExpiryDate: v.guaranteeExpiryDate,
      maximumLiability: v.maximumLiability,
      lenderTypeCode: v.lenderTypeCode,
      involvedParty: v.involvedParty,
    }));

    return {
      facilityInvestorsInAcbs,
      facilityInvestorsFromService,
    };
  }
}
interface GenerateOptions {
  facilityIdentifier: UkefId;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityInvestorsInAcbs: AcbsGetFacilityPartyResponseDto[];
  facilityInvestorsFromService: GetFacilityInvestorResponseItem[];
}
