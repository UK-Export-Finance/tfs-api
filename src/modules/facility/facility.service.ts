import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

import { DateStringTransformations } from '../date/date-string.transformations';
import { GetFacilityByIdentifierResponseDto } from './dto/get-facility-by-identifier-response.dto';

@Injectable()
export class FacilityService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityService: AcbsFacilityService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getFacilityByIdentifier(facilityIdentifier: string): Promise<GetFacilityByIdentifierResponseDto> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const facilityInAcbs = await this.acbsFacilityService.getFacilityByIdentifier(facilityIdentifier, idToken);
    return {
      dealIdentifier: facilityInAcbs.DealIdentifier,
      facilityIdentifier: facilityInAcbs.FacilityIdentifier,
      portfolioIdentifier: facilityInAcbs.DealPortfolioIdentifier,
      dealBorrowerIdentifier: facilityInAcbs.DealBorrowerPartyIdentifier,
      maximumLiability: facilityInAcbs.LimitAmount,
      productTypeId: facilityInAcbs.FacilityType.FacilityTypeCode,
      capitalConversionFactorCode: facilityInAcbs.CapitalConversionFactor.CapitalConversionFactorCode,
      currency: facilityInAcbs.Currency.CurrencyCode,
      guaranteeCommencementDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.UserDefinedDate2),
      guaranteeExpiryDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.ExpirationDate),
      nextQuarterEndDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.UserDefinedDate2),
      facilityInitialStatus: facilityInAcbs.FacilityInitialStatus.FacilityInitialStatusCode,
      facilityOverallStatus: facilityInAcbs.FacilityOverallStatus.FacilityStatusCode,
      delegationType: facilityInAcbs.FacilityUserDefinedList6.FacilityUserDefinedList6Code,
      interestOrFeeRate: facilityInAcbs.UserDefinedAmount3,
      facilityStageCode: facilityInAcbs.FacilityUserDefinedList1.FacilityUserDefinedList1Code,
      exposurePeriod: facilityInAcbs.ExternalReferenceIdentifier,
      creditRatingCode: facilityInAcbs.OfficerRiskRatingType.OfficerRiskRatingTypeCode,
      guaranteePercentage: facilityInAcbs.CompBalPctReserve ?? PROPERTIES.FACILITY.DEFAULT.GET.compBalPctReserve,
      premiumFrequencyCode: facilityInAcbs.FacilityReviewFrequencyType.FacilityReviewFrequencyTypeCode,
      riskCountryCode: facilityInAcbs.RiskCountry.CountryCode,
      riskStatusCode: facilityInAcbs.CreditReviewRiskType.CreditReviewRiskTypeCode,
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.OriginalEffectiveDate),
      foreCastPercentage: facilityInAcbs.CompBalPctAmount ?? PROPERTIES.FACILITY.DEFAULT.GET.compBalPctAmount,
      issueDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.UserDefinedDate1),
      description: facilityInAcbs.Description,
      agentBankIdentifier: facilityInAcbs.AgentBankPartyIdentifier,
      obligorPartyIdentifier: facilityInAcbs.BorrowerParty.PartyIdentifier,
      obligorName: facilityInAcbs.BorrowerParty.PartyName1,
      obligorIndustryClassification: facilityInAcbs.IndustryClassification.IndustryClassificationCode,
      probabilityOfDefault: facilityInAcbs.ProbabilityofDefault,
    };
  }
}
