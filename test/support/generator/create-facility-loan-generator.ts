import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsBundleId, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { NewLoanRequest } from '@ukef/modules/acbs/dto/bundle-actions/new-loan-request.bundle-action';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityLoanRequestDto, CreateFacilityLoanRequestItem } from '@ukef/modules/facility-loan/dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponseDto } from '@ukef/modules/facility-loan/dto/create-facility-loan-response.dto';
import { FacilityLoanToCreate } from '@ukef/modules/facility-loan/facility-loan-to-create.interface';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { TEST_DATES } from '../constants/test-date.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityLoanGenerator extends AbstractGenerator<CreateFacilityLoanRequestItem, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): CreateFacilityLoanRequestItem {
    // Numeric enums needs filter to get possible values.
    const possibleProductTypeIds = Object.values(ENUMS.PRODUCT_TYPE_IDS);
    const possibleProductTypeGroups = Object.values(ENUMS.PRODUCT_TYPE_GROUPS);
    const possibleOperationTypes = Object.values(ENUMS.OPERATION_TYPE_CODES);
    return {
      postingDate: this.valueGenerator.dateOnlyString(),
      facilityIdentifier: this.valueGenerator.ukefId(),
      borrowerPartyIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
      productTypeId: possibleProductTypeIds[this.valueGenerator.integer({ min: 0, max: possibleProductTypeIds.length - 1 })],
      productTypeGroup: possibleProductTypeGroups[this.valueGenerator.integer({ min: 0, max: possibleProductTypeGroups.length - 1 })],
      currency: TEST_CURRENCIES.A_TEST_CURRENCY,
      dealCustomerUsageRate: 0.123,
      dealCustomerUsageOperationType: possibleOperationTypes[this.valueGenerator.integer({ min: 0, max: possibleOperationTypes.length - 1 })],
      amount: 123.45,
      issueDate: this.valueGenerator.dateOnlyString(),
      expiryDate: this.valueGenerator.dateOnlyString(),
    };
  }

  protected transformRawValuesToGeneratedValues(values, { facilityIdentifier, bundleIdentifier }: GenerateOptions): GenerateResult {
    const firstFacilityLoan: CreateFacilityLoanRequestItem = values[0];

    const effectiveDate = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate);

    const bundleMessage = {
      ...this.getBaseMessage(facilityIdentifier, firstFacilityLoan, acbsEffectiveDate),
      ...this.getFieldsThatDependOnGbp(firstFacilityLoan),
    };

    const acbsRequestBodyToCreateFacilityLoan: AcbsCreateBundleInformationRequestDto<NewLoanRequest> = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitiatingUserName: PROPERTIES.FACILITY_LOAN.DEFAULT.initiatingUserName,
      ServicingUserAccountIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUserAccountIdentifier,
      UseAPIUserIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.useAPIUserIndicator,
      InitialBundleStatusCode: PROPERTIES.FACILITY_LOAN.DEFAULT.initialBundleStatusCode,
      PostingDate: this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityLoan.postingDate),
      BundleMessageList: [bundleMessage],
    };

    const requestBodyToCreateFacilityLoan = values.map((value) => ({
      postingDate: value.postingDate,
      facilityIdentifier: facilityIdentifier,
      borrowerPartyIdentifier: value.borrowerPartyIdentifier,
      productTypeId: value.productTypeId,
      productTypeGroup: value.productTypeGroup,
      currency: value.currency,
      dealCustomerUsageRate: value.dealCustomerUsageRate,
      dealCustomerUsageOperationType: value.dealCustomerUsageOperationType,
      amount: value.amount,
      issueDate: effectiveDate,
      expiryDate: value.expiryDate,
    }));

    const createBundleInformationResponseFromAcbs = { BundleIdentifier: bundleIdentifier };
    const createFacilityLoanResponseFromService = { bundleIdentifier };

    return {
      acbsRequestBodyToCreateFacilityLoan,
      requestBodyToCreateFacilityLoan,
      createBundleInformationResponseFromAcbs,
      createFacilityLoanResponseFromService,
    };
  }

  private getBaseMessage(facilityIdentifier: UkefId, facilityLoan: FacilityLoanToCreate, acbsEffectiveDate: string): NewLoanRequest {
    let loanInstrumentCode;
    if (facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.GEF) {
      loanInstrumentCode = ENUMS.PRODUCT_TYPE_IDS.GEF_CASH;
    } else if (facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.BOND) {
      loanInstrumentCode = ENUMS.PRODUCT_TYPE_IDS.BSS;
    } else {
      loanInstrumentCode = ENUMS.PRODUCT_TYPE_IDS.EWCS;
    }

    return {
      $type: PROPERTIES.FACILITY_LOAN.DEFAULT.messageType,
      FacilityIdentifier: facilityIdentifier,
      BorrowerPartyIdentifier: facilityLoan.borrowerPartyIdentifier,
      SectionIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.sectionIdentifier,
      LoanInstrumentCode: loanInstrumentCode,
      Currency: {
        CurrencyCode: facilityLoan.currency,
      },
      LoanAmount: facilityLoan.amount,
      EffectiveDate: acbsEffectiveDate,
      RateSettingDate: acbsEffectiveDate,
      RateMaturityDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.expiryDate),
      MaturityDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.expiryDate),
      ServicingUser: {
        UserAcbsIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUser.userAcbsIdentifier,
        UserName: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUser.userName,
      },
      AdministrativeUser: {
        UserAcbsIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.administrativeUser.userAcbsIdentifier,
        UserName: PROPERTIES.FACILITY_LOAN.DEFAULT.administrativeUser.userName,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUnit.servicingUnitIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUnitSection.servicingUnitSectionIdentifier,
      },
      ClosureType: {
        ClosureTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.closureType.closureTypeCode,
      },
      AgentPartyIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.agentPartyIdentifier,
      AgentAddressIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.agentAddressIdentifier,
      InterestRateType: {
        InterestRateTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.interestRateType.interestRateTypeCode,
      },
      BookingType: {
        LoanBookingTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.bookingType.loanBookingTypeCode,
      },
      LoanReviewFrequencyType: {
        LoanReviewFrequencyTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.loanReviewFrequencyType.loanReviewFrequencyTypeCode,
      },
      CurrentRiskOfficerIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.currentRiskOfficerIdentifier,
      ProductGroup: {
        ProductGroupCode: facilityLoan.productTypeGroup,
      },
      ProductType: {
        ProductTypeCode: facilityLoan.productTypeId,
      },
      LoanAdvanceType: {
        LoanAdvanceTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.loanAdvanceType.loanAdvanceTypeCode,
      },
      GeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.generalLedgerUnit.generalLedgerUnitIdentifier,
      },
      CashEventList: [
        {
          PaymentInstructionCode: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.paymentInstructionCode,
          CashOffsetTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.cashOffsetTypeCode,
          Currency: {
            CurrencyCode: facilityLoan.currency,
          },
          SettlementCurrencyCode: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.settlementCurrencyCode,
          OriginatingGeneralLedgerUnit: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.originatingGeneralLedgerUnit,
          DDAAccount: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.dDAAccount,
          CashDetailAmount: facilityLoan.amount,
          CashReferenceIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.cashReferenceIdentifier,
        },
      ],
      SecuredType: {
        LoanSecuredTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.securedType.loanSecuredTypeCode,
      },
      DealCustomerUsageRate: facilityLoan.dealCustomerUsageRate,
      DealCustomerUsageOperationType: {
        OperationTypeCode: facilityLoan.dealCustomerUsageOperationType,
      },
      AccrualScheduleList: [],
      RepaymentScheduleList: [],
    };
  }

  private getFieldsThatDependOnGbp(facilityLoan: FacilityLoanToCreate) {
    const isNotGbp = facilityLoan.currency !== 'GBP';
    return isNotGbp
      ? {
          FinancialRateGroup: PROPERTIES.FACILITY_LOAN.DEFAULT.financialRateGroup,
          CustomerUsageRateGroup: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageRateGroup,
          FinancialFrequency: {
            UsageFrequencyTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.financialFrequency.usageFrequencyTypeCode,
          },
          CustomerUsageFrequency: {
            UsageFrequencyTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageFrequency.usageFrequencyTypeCode,
          },
          FinancialBusinessDayAdjustment: {
            BusinessDayAdjustmentTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.financialBusinessDayAdjustment.businessDayAdjustmentTypeCode,
          },
          CustomerUsageBusinessDayAdjustment: {
            BusinessDayAdjustmentTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageBusinessDayAdjustment.businessDayAdjustmentTypeCode,
          },
          FinancialCalendar: {
            CalendarIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.financialCalendar.calendarIdentifier,
          },
          CustomerUsageCalendar: {
            CalendarIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageCalendar.calendarIdentifier,
          },
          FinancialNextValuationDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.expiryDate),
          FinancialLockMTMRateIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.financialLockMTMRateIndicator,
          CustomerUsageLockMTMRateIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageLockMTMRateIndicator,
        }
      : {};
  }
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  bundleIdentifier: AcbsBundleId;
}

interface GenerateResult {
  acbsRequestBodyToCreateFacilityLoan: AcbsCreateBundleInformationRequestDto;
  requestBodyToCreateFacilityLoan: CreateFacilityLoanRequestDto;
  createBundleInformationResponseFromAcbs: AcbsCreateBundleInformationResponseHeadersDto;
  createFacilityLoanResponseFromService: CreateFacilityLoanResponseDto;
}
