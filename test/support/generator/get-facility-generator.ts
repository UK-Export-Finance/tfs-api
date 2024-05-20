import { PROPERTIES } from '@ukef/constants';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityByIdentifierResponseDto } from '@ukef/modules/facility/dto/get-facility-by-identifier-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityGenerator extends AbstractGenerator<AcbsGetFacilityResponseDto, GenerateResult, GenerateOptions> {
  constructor(
    protected readonly valueGenerator: RandomValueGenerator,
    protected readonly dateStringTransformations: DateStringTransformations,
  ) {
    super(valueGenerator);
  }

  protected generateValues(): AcbsGetFacilityResponseDto {
    return {
      FacilityIdentifier: this.valueGenerator.ukefId(),
      Description: this.valueGenerator.string(),
      Currency: {
        CurrencyCode: this.valueGenerator.string(),
      },
      OriginalEffectiveDate: this.valueGenerator.dateTimeString(),
      DealIdentifier: this.valueGenerator.string(),
      DealPortfolioIdentifier: this.valueGenerator.string(),
      DealBorrowerPartyIdentifier: this.valueGenerator.acbsPartyId(),
      ExpirationDate: this.valueGenerator.dateTimeString(),
      LimitAmount: this.valueGenerator.nonnegativeFloat(),
      ExternalReferenceIdentifier: this.valueGenerator.string(),
      FacilityType: {
        FacilityTypeCode: this.valueGenerator.string(),
      },
      FacilityInitialStatus: {
        FacilityInitialStatusCode: this.valueGenerator.string(),
      },
      AgentBankPartyIdentifier: this.valueGenerator.acbsPartyId(),
      IndustryClassification: {
        IndustryClassificationCode: this.valueGenerator.string(),
      },
      RiskCountry: {
        CountryCode: this.valueGenerator.string(),
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: this.valueGenerator.string(),
      },
      CapitalConversionFactor: {
        CapitalConversionFactorCode: this.valueGenerator.string(),
      },
      CreditReviewRiskType: {
        CreditReviewRiskTypeCode: this.valueGenerator.string(),
      },
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: this.valueGenerator.string(),
      },
      FacilityUserDefinedList1: {
        FacilityUserDefinedList1Code: this.valueGenerator.string(),
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: this.valueGenerator.string(),
      },
      UserDefinedDate1: this.valueGenerator.dateTimeString(),
      UserDefinedDate2: this.valueGenerator.dateTimeString(),
      UserDefinedAmount3: this.valueGenerator.nonnegativeFloat(),
      ProbabilityofDefault: this.valueGenerator.nonnegativeFloat(),
      FacilityOverallStatus: {
        FacilityStatusCode: this.valueGenerator.string(),
      },
      BorrowerParty: {
        PartyIdentifier: this.valueGenerator.acbsPartyId(),
        PartyName1: this.valueGenerator.string(),
      },
      CompBalPctReserve: this.valueGenerator.nonnegativeFloat(),
      CompBalPctAmount: this.valueGenerator.nonnegativeFloat(),
      AdministrativeUserIdentifier: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: AcbsGetFacilityResponseDto[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilitiesInAcbs: AcbsGetFacilityResponseDto[] = values.map((v) => ({
      FacilityIdentifier: facilityIdentifier,
      Description: v.Description,
      Currency: {
        CurrencyCode: v.Currency.CurrencyCode,
      },
      OriginalEffectiveDate: v.OriginalEffectiveDate,
      DealIdentifier: v.DealIdentifier,
      DealPortfolioIdentifier: portfolioIdentifier,
      DealBorrowerPartyIdentifier: v.DealBorrowerPartyIdentifier,
      ExpirationDate: v.ExpirationDate,
      LimitAmount: v.LimitAmount,
      ExternalReferenceIdentifier: v.ExternalReferenceIdentifier,
      FacilityType: {
        FacilityTypeCode: v.FacilityType.FacilityTypeCode,
      },
      FacilityInitialStatus: {
        FacilityInitialStatusCode: v.FacilityInitialStatus.FacilityInitialStatusCode,
      },
      AgentBankPartyIdentifier: v.AgentBankPartyIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: v.IndustryClassification.IndustryClassificationCode,
      },
      RiskCountry: {
        CountryCode: v.RiskCountry.CountryCode,
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: v.FacilityReviewFrequencyType.FacilityReviewFrequencyTypeCode,
      },
      CapitalConversionFactor: {
        CapitalConversionFactorCode: v.CapitalConversionFactor.CapitalConversionFactorCode,
      },
      CreditReviewRiskType: {
        CreditReviewRiskTypeCode: v.CreditReviewRiskType.CreditReviewRiskTypeCode,
      },
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: v.OfficerRiskRatingType.OfficerRiskRatingTypeCode,
      },
      FacilityUserDefinedList1: {
        FacilityUserDefinedList1Code: v.FacilityUserDefinedList1.FacilityUserDefinedList1Code,
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: v.FacilityUserDefinedList6.FacilityUserDefinedList6Code,
      },
      UserDefinedDate1: v.UserDefinedDate1,
      UserDefinedDate2: v.UserDefinedDate2,
      UserDefinedAmount3: v.UserDefinedAmount3,
      ProbabilityofDefault: v.ProbabilityofDefault,
      FacilityOverallStatus: {
        FacilityStatusCode: v.FacilityOverallStatus.FacilityStatusCode,
      },
      BorrowerParty: {
        PartyIdentifier: v.BorrowerParty.PartyIdentifier,
        PartyName1: v.BorrowerParty.PartyName1,
      },
      CompBalPctReserve: v.CompBalPctReserve,
      CompBalPctAmount: v.CompBalPctAmount,
      AdministrativeUserIdentifier: v.AdministrativeUserIdentifier,
    }));

    const facilitiesFromApi: GetFacilityByIdentifierResponseDto[] = values.map((v) => ({
      dealIdentifier: v.DealIdentifier,
      facilityIdentifier: facilityIdentifier,
      portfolioIdentifier: portfolioIdentifier,
      dealBorrowerIdentifier: v.DealBorrowerPartyIdentifier,
      maximumLiability: v.LimitAmount,
      productTypeId: v.FacilityType.FacilityTypeCode,
      capitalConversionFactorCode: v.CapitalConversionFactor.CapitalConversionFactorCode,
      currency: v.Currency.CurrencyCode,
      guaranteeCommencementDate: this.dateStringTransformations.removeTimeIfExists(v.UserDefinedDate2),
      guaranteeExpiryDate: this.dateStringTransformations.removeTimeIfExists(v.ExpirationDate),
      nextQuarterEndDate: this.dateStringTransformations.removeTimeIfExists(v.UserDefinedDate2),
      facilityInitialStatus: v.FacilityInitialStatus.FacilityInitialStatusCode,
      facilityOverallStatus: v.FacilityOverallStatus.FacilityStatusCode,
      delegationType: v.FacilityUserDefinedList6.FacilityUserDefinedList6Code,
      interestOrFeeRate: v.UserDefinedAmount3,
      facilityStageCode: v.FacilityUserDefinedList1.FacilityUserDefinedList1Code,
      exposurePeriod: v.ExternalReferenceIdentifier,
      creditRatingCode: v.OfficerRiskRatingType.OfficerRiskRatingTypeCode,
      guaranteePercentage: v.CompBalPctReserve ?? PROPERTIES.FACILITY.DEFAULT.GET.compBalPctReserve,
      premiumFrequencyCode: v.FacilityReviewFrequencyType.FacilityReviewFrequencyTypeCode,
      riskCountryCode: v.RiskCountry.CountryCode,
      riskStatusCode: v.CreditReviewRiskType.CreditReviewRiskTypeCode,
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(v.OriginalEffectiveDate),
      forecastPercentage: v.CompBalPctAmount ?? PROPERTIES.FACILITY.DEFAULT.GET.compBalPctAmount,
      issueDate: this.dateStringTransformations.removeTimeIfExists(v.UserDefinedDate1),
      description: v.Description,
      agentBankIdentifier: v.AgentBankPartyIdentifier,
      obligorPartyIdentifier: v.BorrowerParty.PartyIdentifier,
      obligorName: v.BorrowerParty.PartyName1,
      obligorIndustryClassification: v.IndustryClassification.IndustryClassificationCode,
      probabilityOfDefault: v.ProbabilityofDefault,
    }));

    return {
      facilitiesInAcbs,
      facilitiesFromApi,
    };
  }
}

interface GenerateOptions {
  facilityIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilitiesInAcbs: AcbsGetFacilityResponseDto[];
  facilitiesFromApi: GetFacilityByIdentifierResponseDto[];
}
