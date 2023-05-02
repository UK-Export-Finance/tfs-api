import { ENUMS } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsGetFacilityLoanResponseDto, AcbsGetFacilityLoanResponseItem } from '@ukef/modules/acbs/dto/acbs-get-facility-loan-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanResponseDto } from '@ukef/modules/facility-loan/dto/get-facility-loan-response.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityLoanGenerator extends AbstractGenerator<AcbsGetFacilityLoanResponseItem, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): AcbsGetFacilityLoanResponseItem {
    const possibleProductTypeIds = Object.values(ENUMS.PRODUCT_TYPE_IDS);
    const possibleProductTypeGroups = Object.values(ENUMS.PRODUCT_TYPE_GROUPS);

    return {
      PortfolioIdentifier: this.valueGenerator.string(),
      LoanIdentifier: this.valueGenerator.string({ length: 9 }),
      ParentFacilityIdentifier: this.valueGenerator.ukefId(),
      PrimaryParty: {
        PartyIdentifier: this.valueGenerator.acbsPartyId(),
      },
      ProductType: {
        ProductTypeCode: possibleProductTypeIds[this.valueGenerator.integer({ min: 0, max: possibleProductTypeIds.length - 1 })],
      },
      ProductGroup: {
        ProductGroupCode: possibleProductTypeGroups[this.valueGenerator.integer({ min: 0, max: possibleProductTypeGroups.length - 1 })],
      },
      Currency: {
        CurrencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
      },
      EffectiveDate: this.valueGenerator.dateOnlyString(),
      MaturityDate: this.valueGenerator.dateOnlyString(),
      PrincipalBalance: this.valueGenerator.nonnegativeFloat(),
      InterestBalance: this.valueGenerator.nonnegativeFloat(),
      FeeBalance: this.valueGenerator.nonnegativeFloat(),
      OtherBalance: this.valueGenerator.nonnegativeFloat(),
      DiscountedPrincipal: this.valueGenerator.nonnegativeFloat(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: AcbsGetFacilityLoanResponseItem[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityLoansInAcbs: AcbsGetFacilityLoanResponseDto = values.map((v) => ({
      PortfolioIdentifier: portfolioIdentifier,
      LoanIdentifier: v.LoanIdentifier,
      ParentFacilityIdentifier: facilityIdentifier,
      PrimaryParty: {
        PartyIdentifier: v.PrimaryParty.PartyIdentifier,
      },
      ProductType: {
        ProductTypeCode: v.ProductType.ProductTypeCode,
      },
      ProductGroup: {
        ProductGroupCode: v.ProductGroup.ProductGroupCode,
      },
      Currency: {
        CurrencyCode: v.Currency.CurrencyCode,
      },
      EffectiveDate: v.EffectiveDate,
      MaturityDate: v.MaturityDate,
      PrincipalBalance: v.PrincipalBalance,
      InterestBalance: v.InterestBalance,
      FeeBalance: v.FeeBalance,
      OtherBalance: v.OtherBalance,
      DiscountedPrincipal: v.DiscountedPrincipal,
    }));

    const facilityLoansFromApi = values.map((v) => ({
      portfolioIdentifier: portfolioIdentifier,
      loanIdentifier: v.LoanIdentifier,
      facilityIdentifier: facilityIdentifier,
      borrowerPartyIdentifier: v.PrimaryParty.PartyIdentifier,
      productTypeId: v.ProductType.ProductTypeCode,
      productTypeGroup: v.ProductGroup.ProductGroupCode,
      currency: v.Currency.CurrencyCode,
      issueDate: this.dateStringTransformations.removeTime(v.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTime(v.MaturityDate),
      principalBalance: v.PrincipalBalance,
      interestBalance: v.InterestBalance,
      feeBalance: v.FeeBalance,
      otherBalance: v.OtherBalance,
      discountedPrincipal: v.DiscountedPrincipal,
    }));

    return {
      facilityLoansInAcbs,
      facilityLoansFromApi,
    };
  }
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityLoansInAcbs: AcbsGetFacilityLoanResponseDto;
  facilityLoansFromApi: GetFacilityLoanResponseDto;
}
