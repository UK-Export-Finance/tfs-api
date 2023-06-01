import { ENUMS, PROPERTIES } from '@ukef/constants';
import { OperationTypeCodeEnum } from '@ukef/constants/enums/operation-type-code';
import { ProductTypeGroupEnum } from '@ukef/constants/enums/product-type-group';
import { ProductTypeIdEnum } from '@ukef/constants/enums/product-type-id';
import { AcbsPartyId, DateString, UkefId } from '@ukef/helpers';
import { AcbsGetBundleInformationResponseDto } from '@ukef/modules/acbs/dto/acbs-get-bundle-information-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionResponseDto } from '@ukef/modules/facility-loan-transaction/dto/get-facility-loan-transaction-response.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityLoanTransactionGenerator extends AbstractGenerator<FacilityLoanTransactionValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityLoanTransactionValues {
    // Numeric enums needs filter to get possible values.
    const possibleInitialBundleStatusCodes = Object.values(ENUMS.INITIAL_BUNDLE_STATUS_CODES).filter((value) => !isNaN(Number(value)));
    const possibleProductTypeIds = Object.values(ENUMS.PRODUCT_TYPE_IDS);
    const possibleProductTypeGroups = Object.values(ENUMS.PRODUCT_TYPE_GROUPS);
    const possibleOperationTypeCodes = Object.values(ENUMS.OPERATION_TYPE_CODES);

    return {
      bundleStatusCode: this.valueGenerator.stringOfNumericCharacters({ length: 2 }),
      bundleStatusShortDescription: this.valueGenerator.string({ minLength: 0, maxLength: 20 }),
      postingDate: this.valueGenerator.dateOnlyString(),
      borrowerPartyIdentifier: this.valueGenerator.acbsPartyId(),
      currencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
      dealCustomerUsageRate: this.valueGenerator.nonnegativeFloat(),
      operationTypeCode: possibleOperationTypeCodes[this.valueGenerator.integer({ min: 0, max: possibleOperationTypeCodes.length - 1 })],
      loanAmount: this.valueGenerator.nonnegativeFloat(),
      effectiveDate: this.valueGenerator.dateOnlyString(),
      maturityDate: this.valueGenerator.dateOnlyString(),
      productGroupCode: possibleProductTypeGroups[this.valueGenerator.integer({ min: 0, max: possibleProductTypeGroups.length - 1 })],
      productTypeCode: possibleProductTypeIds[this.valueGenerator.integer({ min: 0, max: possibleProductTypeIds.length - 1 })],
      spreadRate: this.valueGenerator.nonnegativeFloat(),
      spreadRateCTL: this.valueGenerator.nonnegativeFloat(),
      yearBasisCode: this.valueGenerator.string({ length: 1 }),
      indexRateChangeFrequencyCode: this.valueGenerator.string({ length: 1 }),
      nextDueDate: this.valueGenerator.dateOnlyString(),
      loanBillingFrequencyTypeCode: this.valueGenerator.string({ length: 1 }),
      initialBundleStatusCode: possibleInitialBundleStatusCodes[
        this.valueGenerator.integer({ min: 0, max: possibleInitialBundleStatusCodes.length - 1 })
      ] as number,
      initiatingUserName: this.valueGenerator.string({ maxLength: 60 }),
    };
  }

  protected transformRawValuesToGeneratedValues(
    facilityLoanTransactions: FacilityLoanTransactionValues[],
    { facilityIdentifier }: GenerateOptions,
  ): GenerateResult {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const [firstFacilityLoanTransaction] = facilityLoanTransactions;
    const postingDateTime = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityLoanTransaction.postingDate);
    const effectiveDateTime = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityLoanTransaction.effectiveDate);
    const maturityDateTime = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityLoanTransaction.maturityDate);
    const nextDueDateTime = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityLoanTransaction.nextDueDate);

    const acbsFacilityLoanTransaction: AcbsGetBundleInformationResponseDto = {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: firstFacilityLoanTransaction.initialBundleStatusCode,
      BundleStatus: {
        BundleStatusCode: firstFacilityLoanTransaction.bundleStatusCode,
        BundleStatusShortDescription: firstFacilityLoanTransaction.bundleStatusShortDescription,
      },
      InitiatingUserName: firstFacilityLoanTransaction.initiatingUserName,
      PostingDate: postingDateTime,
      BundleMessageList: [
        {
          $type: 'NewLoanRequest',
          FacilityIdentifier: facilityIdentifier,
          BorrowerPartyIdentifier: firstFacilityLoanTransaction.borrowerPartyIdentifier,
          Currency: {
            CurrencyCode: firstFacilityLoanTransaction.currencyCode,
          },
          DealCustomerUsageRate: firstFacilityLoanTransaction.dealCustomerUsageRate,
          DealCustomerUsageOperationType: {
            OperationTypeCode: firstFacilityLoanTransaction.operationTypeCode,
          },
          LoanAmount: firstFacilityLoanTransaction.loanAmount,
          EffectiveDate: effectiveDateTime,
          MaturityDate: maturityDateTime,
          ProductGroup: {
            ProductGroupCode: firstFacilityLoanTransaction.productGroupCode,
          },
          ProductType: {
            ProductTypeCode: firstFacilityLoanTransaction.productTypeCode,
          },
          AccrualScheduleList: [
            {
              AccrualCategory: {
                AccrualCategoryCode: '',
              },
              SpreadRate: 0,
              YearBasis: {
                YearBasisCode: firstFacilityLoanTransaction.yearBasisCode,
              },
              IndexRateChangeFrequency: {
                IndexRateChangeFrequencyCode: '',
              },
            },
            {
              AccrualCategory: {
                AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
              },
              SpreadRate: firstFacilityLoanTransaction.spreadRate,
              YearBasis: {
                YearBasisCode: '',
              },
              IndexRateChangeFrequency: {
                IndexRateChangeFrequencyCode: firstFacilityLoanTransaction.indexRateChangeFrequencyCode,
              },
            },
            {
              AccrualCategory: {
                AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
              },
              SpreadRate: firstFacilityLoanTransaction.spreadRateCTL,
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
              NextDueDate: nextDueDateTime,
              LoanBillingFrequencyType: {
                LoanBillingFrequencyTypeCode: firstFacilityLoanTransaction.loanBillingFrequencyTypeCode,
              },
            },
          ],
        },
      ],
    };

    const apiFacilityLoanTransaction: GetFacilityLoanTransactionResponseDto = {
      portfolioIdentifier: portfolioIdentifier,
      bundleStatusCode: firstFacilityLoanTransaction.bundleStatusCode,
      bundleStatusDesc: firstFacilityLoanTransaction.bundleStatusShortDescription,
      postingDate: firstFacilityLoanTransaction.postingDate,
      facilityIdentifier: facilityIdentifier,
      borrowerPartyIdentifier: firstFacilityLoanTransaction.borrowerPartyIdentifier,
      productTypeId: firstFacilityLoanTransaction.productTypeCode,
      productTypeGroup: firstFacilityLoanTransaction.productGroupCode,
      currency: firstFacilityLoanTransaction.currencyCode,
      dealCustomerUsageRate: firstFacilityLoanTransaction.dealCustomerUsageRate,
      dealCustomerUsageOperationType: firstFacilityLoanTransaction.operationTypeCode,
      amount: firstFacilityLoanTransaction.loanAmount,
      issueDate: firstFacilityLoanTransaction.effectiveDate,
      expiryDate: firstFacilityLoanTransaction.maturityDate,
      spreadRate: firstFacilityLoanTransaction.spreadRate,
      spreadRateCTL: firstFacilityLoanTransaction.spreadRateCTL,
      yearBasis: firstFacilityLoanTransaction.yearBasisCode,
      nextDueDate: firstFacilityLoanTransaction.nextDueDate,
      indexRateChangeFrequency: firstFacilityLoanTransaction.indexRateChangeFrequencyCode,
      loanBillingFrequencyType: firstFacilityLoanTransaction.loanBillingFrequencyTypeCode,
    };

    return {
      acbsFacilityLoanTransaction,
      apiFacilityLoanTransaction,
    };
  }
}

interface FacilityLoanTransactionValues {
  bundleStatusCode: string;
  bundleStatusShortDescription: string;
  postingDate: DateString;
  borrowerPartyIdentifier: AcbsPartyId;
  currencyCode: string;
  dealCustomerUsageRate: number;
  operationTypeCode: OperationTypeCodeEnum;
  loanAmount: number;
  effectiveDate: DateString;
  maturityDate: DateString;
  productGroupCode: ProductTypeGroupEnum;
  productTypeCode: ProductTypeIdEnum;
  spreadRate: number;
  spreadRateCTL: number;
  yearBasisCode: string;
  indexRateChangeFrequencyCode: string;
  nextDueDate: DateString;
  loanBillingFrequencyTypeCode: string;
  initialBundleStatusCode: number;
  initiatingUserName: string;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
}

interface GenerateResult {
  acbsFacilityLoanTransaction: AcbsGetBundleInformationResponseDto;
  apiFacilityLoanTransaction: GetFacilityLoanTransactionResponseDto;
}
