import { ENUMS, PROPERTIES } from '@ukef/constants';
import { OperationTypeCodeEnum } from '@ukef/constants/enums/operation-type-code';
import { ProductTypeGroupEnum } from '@ukef/constants/enums/product-type-group';
import { ProductTypeIdEnum } from '@ukef/constants/enums/product-type-id';
import { AcbsPartyId, DateString, UkefId } from '@ukef/helpers';
import { AcbsGetFacilityLoanTransactionResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-loan-transaction-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionResponseDto } from '@ukef/modules/facility-loan-transaction/dto/get-loan-transaction-response.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityLoanTransactionGenerator extends AbstractGenerator<FacilityLoanTransactionValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityLoanTransactionValues {
    const possibleProductTypeIds = Object.values(ENUMS.PRODUCT_TYPE_IDS);
    const possibleProductTypeGroups = Object.values(ENUMS.PRODUCT_TYPE_GROUPS);
    const possibleOperationTypeCodes = Object.values(ENUMS.OPERATION_TYPE_CODES);

    return {
      BundleStatusCode: this.valueGenerator.stringOfNumericCharacters({ length: 2 }),
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
      YearBasisCode: this.valueGenerator.string({ length: 1 }),
      IndexRateChangeFrequencyCode: this.valueGenerator.string({ length: 1 }),
      NextDueDate: this.valueGenerator.dateTimeString(),
      LoanBillingFrequencyTypeCode: this.valueGenerator.string({ length: 1 }),
    };
  }

  protected transformRawValuesToGeneratedValues(
    valuesList: FacilityLoanTransactionValues[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityLoanTransactionsInAcbs: AcbsGetFacilityLoanTransactionResponseDto = valuesList.map((values) => ({
      PortfolioIdentifier: portfolioIdentifier,
      BundleStatus: {
        BundleStatusCode: values.BundleStatusCode,
        BundleStatusShortDescription: values.BundleStatusShortDescription,
      },
      PostingDate: values.PostingDate,
      BundleMessageList: [
        {
          $type: 'NewLoanRequest',
          FacilityIdentifier: facilityIdentifier,
          BorrowerPartyIdentifier: values.BorrowerPartyIdentifier,
          Currency: {
            CurrencyCode: values.CurrencyCode,
          },
          DealCustomerUsageRate: values.DealCustomerUsageRate,
          DealCustomerUsageOperationType: {
            OperationTypeCode: values.OperationTypeCode,
          },
          LoanAmount: values.LoanAmount,
          EffectiveDate: values.EffectiveDate,
          MaturityDate: values.MaturityDate,
          ProductGroup: {
            ProductGroupCode: values.ProductGroupCode,
          },
          ProductType: {
            ProductTypeCode: values.ProductTypeCode,
          },
          AccrualScheduleList: [
            {
              AccrualCategory: {
                AccrualCategoryCode: '',
              },
              SpreadRate: 0,
              YearBasis: {
                YearBasisCode: values.YearBasisCode,
              },
              IndexRateChangeFrequency: {
                IndexRateChangeFrequencyCode: '',
              },
            },
            {
              AccrualCategory: {
                AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
              },
              SpreadRate: values.SpreadRate,
              YearBasis: {
                YearBasisCode: '',
              },
              IndexRateChangeFrequency: {
                IndexRateChangeFrequencyCode: values.IndexRateChangeFrequencyCode,
              },
            },
            {
              AccrualCategory: {
                AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
              },
              SpreadRate: values.SpreadRateCTL,
              YearBasis: {
                YearBasisCode: '',
              },
              IndexRateChangeFrequency: {
                IndexRateChangeFrequencyCode: '',
              },
            },
          ],
          RepaymentScheduleList: [
            {
              NextDueDate: values.NextDueDate,
              LoanBillingFrequencyType: {
                LoanBillingFrequencyTypeCode: values.LoanBillingFrequencyTypeCode,
              },
            },
          ],
        },
      ],
    }));

    const facilityLoanTransactionsFromApi = valuesList.map((values) => ({
      portfolioIdentifier: portfolioIdentifier,
      bundleStatusCode: values.BundleStatusCode,
      bundleStatusDesc: values.BundleStatusShortDescription,
      postingDate: this.dateStringTransformations.removeTime(values.PostingDate),
      facilityIdentifier: facilityIdentifier,
      borrowerPartyIdentifier: values.BorrowerPartyIdentifier,
      productTypeId: values.ProductTypeCode,
      productTypeGroup: values.ProductGroupCode,
      currency: values.CurrencyCode,
      dealCustomerUsageRate: values.DealCustomerUsageRate,
      dealCustomerUsageOperationType: values.OperationTypeCode,
      amount: values.LoanAmount,
      issueDate: this.dateStringTransformations.removeTime(values.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTime(values.MaturityDate),
      spreadRate: values.SpreadRate,
      spreadRateCTL: values.SpreadRateCTL,
      yearBasis: values.YearBasisCode,
      nextDueDate: this.dateStringTransformations.removeTime(values.NextDueDate),
      indexRateChangeFrequency: values.IndexRateChangeFrequencyCode,
      loanBillingFrequencyType: values.LoanBillingFrequencyTypeCode,
    }));

    return {
      facilityLoanTransactionsInAcbs,
      facilityLoanTransactionsFromApi,
    };
  }
}

interface FacilityLoanTransactionValues {
  BundleStatusCode: string;
  BundleStatusShortDescription: string;
  PostingDate: DateString;
  BorrowerPartyIdentifier: AcbsPartyId;
  CurrencyCode: string;
  DealCustomerUsageRate: number;
  OperationTypeCode: OperationTypeCodeEnum;
  LoanAmount: number;
  EffectiveDate: DateString;
  MaturityDate: DateString;
  ProductGroupCode: ProductTypeGroupEnum;
  ProductTypeCode: ProductTypeIdEnum;
  SpreadRate: number;
  SpreadRateCTL: number;
  YearBasisCode: string;
  IndexRateChangeFrequencyCode: string;
  NextDueDate: DateString;
  LoanBillingFrequencyTypeCode: string;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityLoanTransactionsInAcbs: AcbsGetFacilityLoanTransactionResponseDto;
  facilityLoanTransactionsFromApi: GetFacilityLoanTransactionResponseDto;
}
