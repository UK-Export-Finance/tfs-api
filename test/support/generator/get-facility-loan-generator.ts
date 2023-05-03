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
    facilityLoans: AcbsGetFacilityLoanResponseItem[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityLoansInAcbs: AcbsGetFacilityLoanResponseDto = facilityLoans.map((facilityLoan) => ({
      PortfolioIdentifier: portfolioIdentifier,
      LoanIdentifier: facilityLoan.LoanIdentifier,
      ParentFacilityIdentifier: facilityIdentifier,
      PrimaryParty: {
        PartyIdentifier: facilityLoan.PrimaryParty.PartyIdentifier,
      },
      ProductType: {
        ProductTypeCode: facilityLoan.ProductType.ProductTypeCode,
      },
      ProductGroup: {
        ProductGroupCode: facilityLoan.ProductGroup.ProductGroupCode,
      },
      Currency: {
        CurrencyCode: facilityLoan.Currency.CurrencyCode,
      },
      EffectiveDate: facilityLoan.EffectiveDate,
      MaturityDate: facilityLoan.MaturityDate,
      PrincipalBalance: facilityLoan.PrincipalBalance,
      InterestBalance: facilityLoan.InterestBalance,
      FeeBalance: facilityLoan.FeeBalance,
      OtherBalance: facilityLoan.OtherBalance,
      DiscountedPrincipal: facilityLoan.DiscountedPrincipal,
    }));

    const facilityLoansFromApi = facilityLoans.map((facilityLoan) => ({
      portfolioIdentifier: portfolioIdentifier,
      loanIdentifier: facilityLoan.LoanIdentifier,
      facilityIdentifier: facilityIdentifier,
      borrowerPartyIdentifier: facilityLoan.PrimaryParty.PartyIdentifier,
      productTypeId: facilityLoan.ProductType.ProductTypeCode,
      productTypeGroup: facilityLoan.ProductGroup.ProductGroupCode,
      currency: facilityLoan.Currency.CurrencyCode,
      issueDate: this.dateStringTransformations.removeTime(facilityLoan.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTime(facilityLoan.MaturityDate),
      principalBalance: facilityLoan.PrincipalBalance,
      interestBalance: facilityLoan.InterestBalance,
      feeBalance: facilityLoan.FeeBalance,
      otherBalance: facilityLoan.OtherBalance,
      discountedPrincipal: facilityLoan.DiscountedPrincipal,
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
