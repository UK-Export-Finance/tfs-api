import { ENUMS } from '@ukef/constants';
import { OperationTypeCodeEnum } from '@ukef/constants/enums/operation-type-code';
import { ProductTypeGroupEnum } from '@ukef/constants/enums/product-type-group';
import { ProductTypeIdEnum } from '@ukef/constants/enums/product-type-id';
import { AcbsPartyId, DateString, UkefId } from '@ukef/helpers';
import { AcbsGetFacilityLoanTransactionResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-loan-transaction-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionResponseDto } from '@ukef/modules/facility-loan-transaction/get-loan-transaction-response.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityLoanGenerator extends AbstractGenerator<FacilityLoanTransactionValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityLoanTransactionValues {
    const possibleProductTypeIds = Object.values(ENUMS.PRODUCT_TYPE_IDS);
    const possibleProductTypeGroups = Object.values(ENUMS.PRODUCT_TYPE_GROUPS);
    const possibleOperationTypeCodes = Object.values(ENUMS.OPERATION_TYPE_CODES);

    return {
      BundleStatusCode: this.valueGenerator.stringOfNumericCharacters({ length: 2}),
      BundleStatusShortDescription: this.valueGenerator.string({ minLength: 0, maxLength: 20 }),
      PostingDate: this.valueGenerator.dateOnlyString(),
      BorrowerPartyIdentifier: this.valueGenerator.acbsPartyId(),
      CurrencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
      DealCustomerUsageRate: this.valueGenerator.nonnegativeFloat(),
      OperationTypeCode: possibleOperationTypeCodes[this.valueGenerator.integer({ min: 0, max: possibleOperationTypeCodes.length - 1 })],
      LoanAmount: this.valueGenerator.nonnegativeFloat(),
      EffectiveDate: this.valueGenerator.dateTimeString(),
      MaturityDate: this.valueGenerator.dateTimeString(),
      ProductGroupCode: possibleProductTypeGroups[this.valueGenerator.integer({ min: 0, max: possibleProductTypeGroups.length - 1 })],
      ProductTypeCode: possibleProductTypeIds[this.valueGenerator.integer({ min: 0, max: possibleProductTypeIds.length - 1 })],
      SpreadRate: this.valueGenerator.nonnegativeFloat(),
      SpreadRateCTL: this.valueGenerator.nonnegativeFloat(),
      YearBasisCode: this.valueGenerator.string({length: 1}),
      IndexRateChangeFrequencyCode: this.valueGenerator.string({length: 1}),
      NextDueDate: this.valueGenerator.dateTimeString(),
      LoanBillingFrequencyTypeCode: this.valueGenerator.string({length: 1}),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: FacilityLoanTransactionValues[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityLoanTransactionsInAcbs: AcbsGetFacilityLoanTransactionResponseDto = values.map((v) => ({
      PortfolioIdentifier: portfolioIdentifier,
      BundleStatus: {
        BundleStatusCode: v.BundleStatusCode,
        BundleStatusShortDescription: v.BundleStatusShortDescription,
      },
      PostingDate: v.PostingDate,
      BundleMessageList: [
        {
          FacilityIdentifier: facilityIdentifier,
          BorrowerPartyIdentifier: v.BorrowerPartyIdentifier,
          Currency: {
            CurrencyCode: v.CurrencyCode,
          },
          DealCustomerUsageRate: v.DealCustomerUsageRate,
          DealCustomerUsageOperationType: {
            OperationTypeCode: v.OperationTypeCode,
          },
          LoanAmount: v.LoanAmount,
          EffectiveDate: v.EffectiveDate,
          MaturityDate: v.MaturityDate,
          ProductGroup: {
            ProductGroupCode: v.ProductGroupCode,
          },
          ProductType: {
            ProductTypeCode: v.ProductTypeCode,
          },
          AccrualScheduleList: [
            {
              YearBasis: {
                YearBasisCode: v.YearBasisCode
              },
            },
            {
              AccrualCategory: {
                AccrualCategoryCode: 'PAC01', // TODO: constant
              },
              SpreadRate: v.SpreadRate,
              IndexRateChangeFrequency: {    IndexRateChangeFrequencyCode: v.IndexRateChangeFrequencyCode,  },
            },
            {
              AccrualCategory: {
                AccrualCategoryCode: 'CTL01', // TODO: constant
              },
              SpreadRate: v.SpreadRateCTL,
            },
          ],
          RepaymentScheduleList: [
            {
              NextDueDate: v.NextDueDate,
              LoanBillingFrequencyType: {
                LoanBillingFrequencyTypeCode: v.LoanBillingFrequencyTypeCode
              },
            },
          ],
        },
      ]
    }));

    const facilityLoanTransactionsFromApi = values.map((v) => ({
      portfolioIdentifier: portfolioIdentifier,
      bundleStatusCode: v.BundleStatusCode,
      bundleStatusDesc: v.BundleStatusShortDescription,
      postingDate: this.dateStringTransformations.removeTime(v.PostingDate),
      facilityIdentifier: facilityIdentifier,
      borrowerPartyIdentifier: v.BorrowerPartyIdentifier,
      productTypeId: v.ProductTypeCode,
      productTypeGroup: v.ProductTypeCode,
      currency: v.CurrencyCode,
      dealCustomerUsageRate: v.DealCustomerUsageRate,
      dealCustomerUsageOperationType: v.OperationTypeCode,
      amount: v.LoanAmount,
      issueDate: this.dateStringTransformations.removeTime(v.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTime(v.MaturityDate),
      spreadRate: v.SpreadRate,
      spreadRateCTL: v.SpreadRateCTL,
      yearBasis: v.YearBasisCode,  
      nextDueDate: this.dateStringTransformations.removeTime(v.NextDueDate),
      indexRateChangeFrequency: v.IndexRateChangeFrequencyCode,
      loanBillingFrequencyType: v.LoanBillingFrequencyTypeCode,
    }));

    return {
      facilityLoanTransactionsInAcbs,
      facilityLoanTransactionsFromApi,
    };
  }
}

interface FacilityLoanTransactionValues {
  BundleStatusCode: string,
  BundleStatusShortDescription: string,
  PostingDate: DateString,
  BorrowerPartyIdentifier: AcbsPartyId,
  CurrencyCode: string,
  DealCustomerUsageRate: number,
  OperationTypeCode: OperationTypeCodeEnum,
  LoanAmount: number,
  EffectiveDate: DateString,
  MaturityDate: DateString,
  ProductGroupCode: ProductTypeGroupEnum,
  ProductTypeCode: ProductTypeIdEnum,
  SpreadRate: number,
  SpreadRateCTL: number,
  YearBasisCode: string,
  IndexRateChangeFrequencyCode: string,
  NextDueDate: DateString,
  LoanBillingFrequencyTypeCode: string,
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityLoanTransactionsInAcbs: AcbsGetFacilityLoanTransactionResponseDto;
  facilityLoanTransactionsFromApi: GetFacilityLoanTransactionResponseDto;
}
