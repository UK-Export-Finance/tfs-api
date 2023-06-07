import { ProductTypeGroupEnum } from '@ukef/constants/enums/product-type-group';
import { ProductTypeIdEnum } from '@ukef/constants/enums/product-type-id';
import { DateOnlyString, DateString, UkefId } from '@ukef/helpers';
import { AcbsGetLoanByLoanIdentifierResponseDto } from '@ukef/modules/acbs/dto/acbs-get-loan-by-loan-identifier-response.dto';
import { AcbsUpdateLoanRequest } from '@ukef/modules/acbs/dto/acbs-update-loan-request.dto';
import { AcbsBaseLoan } from '@ukef/modules/acbs/dto/base-entities/acbs-base-loan-response.interface';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateLoanExpiryDateRequest } from '@ukef/modules/facility-loan/dto/update-loan-expiry-date-request.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class UpdateLoanGenerator extends AbstractGenerator<LoanValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): LoanValues {
    const effectiveDate = this.valueGenerator.dateOnlyString();
    const maturityDate = this.valueGenerator.dateOnlyString();
    const rateMaturityDate = this.valueGenerator.dateOnlyString();
    const newExpiryDate = this.valueGenerator.dateOnlyString();
    return {
      PrimaryParty: {
        PartyIdentifier: this.valueGenerator.acbsPartyId(),
      },
      ProductType: {
        ProductTypeCode: this.valueGenerator.enumValue(ProductTypeIdEnum),
      },
      ProductGroup: {
        ProductGroupCode: this.valueGenerator.enumValue(ProductTypeGroupEnum),
      },
      Currency: {
        CurrencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
      },
      PrincipalBalance: this.valueGenerator.nonnegativeFloat(),
      InterestBalance: this.valueGenerator.nonnegativeFloat(),
      FeeBalance: this.valueGenerator.nonnegativeFloat(),
      OtherBalance: this.valueGenerator.nonnegativeFloat(),
      DiscountedPrincipal: this.valueGenerator.nonnegativeFloat(),
      IsRateMaturityDateZero: false,

      effectiveDate,
      maturityDate,
      rateMaturityDate,
      newExpiryDate,

      acbsEffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate),
      acbsMaturityDate: this.dateStringTransformations.addTimeToDateOnlyString(maturityDate),
      acbsRateMaturityDate: this.dateStringTransformations.addTimeToDateOnlyString(rateMaturityDate),
      acbsNewExpiryDate: this.dateStringTransformations.addTimeToDateOnlyString(newExpiryDate),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: LoanValues[],
    { facilityIdentifier, portfolioIdentifier, loanIdentifier }: GenerateOptions,
  ): GenerateResult {
    const [loan] = values;

    const acbsBaseLoan: AcbsBaseLoan = {
      PortfolioIdentifier: portfolioIdentifier,
      LoanIdentifier: loanIdentifier,
      ParentFacilityIdentifier: facilityIdentifier,
      PrimaryParty: {
        PartyIdentifier: loan.PrimaryParty.PartyIdentifier,
      },
      ProductType: {
        ProductTypeCode: loan.ProductType.ProductTypeCode,
      },
      ProductGroup: {
        ProductGroupCode: loan.ProductGroup.ProductGroupCode,
      },
      Currency: {
        CurrencyCode: loan.Currency.CurrencyCode,
      },
      EffectiveDate: loan.acbsEffectiveDate,
      MaturityDate: loan.acbsMaturityDate,
      PrincipalBalance: loan.PrincipalBalance,
      InterestBalance: loan.InterestBalance,
      FeeBalance: loan.FeeBalance,
      OtherBalance: loan.OtherBalance,
      DiscountedPrincipal: loan.DiscountedPrincipal,
      RateMaturityDate: loan.acbsRateMaturityDate,
      IsRateMaturityDateZero: loan.IsRateMaturityDateZero,
    };

    const acbsGetExistingLoanResponse: AcbsGetLoanByLoanIdentifierResponseDto = { ...acbsBaseLoan };
    const acbsUpdateLoanRequest: AcbsUpdateLoanRequest = {
      ...acbsBaseLoan,
      MaturityDate: loan.acbsNewExpiryDate,
      RateMaturityDate: loan.acbsNewExpiryDate,
      IsRateMaturityDateZero: false,
    };
    const updateLoanExpiryDateRequest: UpdateLoanExpiryDateRequest = { expiryDate: loan.newExpiryDate };

    return {
      acbsGetExistingLoanResponse,
      acbsUpdateLoanRequest,
      updateLoanExpiryDateRequest,
    };
  }
}

interface LoanValues {
  PrimaryParty: {
    PartyIdentifier: string;
  };
  Currency: {
    CurrencyCode: string;
  };
  PrincipalBalance: number;
  InterestBalance: number;
  FeeBalance: number;
  OtherBalance: number;
  DiscountedPrincipal: number;
  ProductGroup: {
    ProductGroupCode: string;
  };
  ProductType: {
    ProductTypeCode: string;
  };
  IsRateMaturityDateZero: boolean;

  newExpiryDate: DateOnlyString;
  effectiveDate: DateString;
  maturityDate: DateString;
  rateMaturityDate: DateString;

  acbsNewExpiryDate: DateString;
  acbsEffectiveDate: DateString;
  acbsMaturityDate: DateString;
  acbsRateMaturityDate: DateString;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  loanIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  acbsUpdateLoanRequest: AcbsUpdateLoanRequest;
  acbsGetExistingLoanResponse: AcbsGetLoanByLoanIdentifierResponseDto;
  updateLoanExpiryDateRequest: UpdateLoanExpiryDateRequest;
}
