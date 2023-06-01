import { ENUMS, PROPERTIES } from '@ukef/constants';
import { CALENDAR_IDENTIFIERS } from '@ukef/constants/calendar-identifiers.constant';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { AcbsBundleId, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { NewLoanRequest } from '@ukef/modules/acbs/dto/bundle-actions/new-loan-request.bundle-action';
import { RepaymentSchedule } from '@ukef/modules/acbs/dto/bundle-actions/repayment-schedule.interface';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityLoanRequest, CreateFacilityLoanRequestItem } from '@ukef/modules/facility-loan/dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponse } from '@ukef/modules/facility-loan/dto/create-facility-loan-response.dto';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityLoanGenerator extends AbstractGenerator<CreateFacilityLoanRequestItem, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): CreateFacilityLoanRequestItem {
    const possibleOperationTypes = Object.values(ENUMS.OPERATION_TYPE_CODES);
    const possibleLoanBillingFrequencyTypes = Object.values(ENUMS.FEE_FREQUENCY_TYPES);
    return {
      postingDate: this.valueGenerator.dateOnlyString(),
      borrowerPartyIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
      productTypeId: ENUMS.PRODUCT_TYPE_IDS.BSS,
      productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.BOND,
      currency: CURRENCIES.GBP,
      dealCustomerUsageRate: 0.123,
      dealCustomerUsageOperationType: possibleOperationTypes[this.valueGenerator.integer({ min: 0, max: possibleOperationTypes.length - 1 })],
      amount: 123.45,
      issueDate: this.valueGenerator.dateOnlyString(),
      expiryDate: this.valueGenerator.dateOnlyString(),
      nextDueDate: this.valueGenerator.dateOnlyString(),
      loanBillingFrequencyType: possibleLoanBillingFrequencyTypes[this.valueGenerator.integer({ min: 0, max: possibleOperationTypes.length - 1 })],
    };
  }

  protected transformRawValuesToGeneratedValues(values, { facilityIdentifier, bundleIdentifier }: GenerateOptions): GenerateResult {
    const [firstFacilityLoan] = values;

    const effectiveDate = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate);

    const bundleMessageGbp = {
      ...this.getBaseMessage(facilityIdentifier, firstFacilityLoan, acbsEffectiveDate),
    };

    const bundleMessageNonGbp = {
      ...bundleMessageGbp,
      Currency: {
        CurrencyCode: TEST_CURRENCIES.NON_GBP_CURRENCY,
      },
      CashEventList: [
        {
          ...bundleMessageGbp.CashEventList[0],
          Currency: {
            CurrencyCode: TEST_CURRENCIES.NON_GBP_CURRENCY,
          },
        },
      ],
      ...this.getNonGbpDependentFields(firstFacilityLoan),
    };

    const acbsRequestBodyToCreateFacilityLoanGbp: AcbsCreateBundleInformationRequestDto<NewLoanRequest> = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitiatingUserName: PROPERTIES.FACILITY_LOAN.DEFAULT.initiatingUserName,
      ServicingUserAccountIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUserAccountIdentifier,
      UseAPIUserIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.useAPIUserIndicator,
      InitialBundleStatusCode: PROPERTIES.FACILITY_LOAN.DEFAULT.initialBundleStatusCode,
      PostingDate: this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityLoan.postingDate),
      BundleMessageList: [bundleMessageGbp],
    };

    const acbsRequestBodyToCreateFacilityLoanNonGbp: AcbsCreateBundleInformationRequestDto<NewLoanRequest> = {
      ...acbsRequestBodyToCreateFacilityLoanGbp,
      BundleMessageList: [bundleMessageNonGbp],
    };

    const requestBodyToCreateFacilityLoanGbp = values.map((value) => ({
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
      nextDueDate: value.nextDueDate,
      loanBillingFrequencyType: value.loanBillingFrequencyType,
    }));

    const requestBodyToCreateFacilityLoanNonGbp = [
      {
        ...requestBodyToCreateFacilityLoanGbp[0],
        currency: TEST_CURRENCIES.NON_GBP_CURRENCY,
      },
    ];

    const createBundleInformationResponseFromAcbs = { BundleIdentifier: bundleIdentifier };
    const createFacilityLoanResponseFromService = { bundleIdentifier };
    const bondRepaymentSchedulesGbp = this.getBondRepaymentSchedules(firstFacilityLoan);
    const ewcsRepaymentSchedulesGbp = this.getEwcsRepaymentSchedules(firstFacilityLoan);
    const gefRepaymentSchedulesGbp = this.getGefRepaymentSchedules(firstFacilityLoan);

    return {
      acbsRequestBodyToCreateFacilityLoanGbp,
      acbsRequestBodyToCreateFacilityLoanNonGbp,
      requestBodyToCreateFacilityLoanGbp,
      requestBodyToCreateFacilityLoanNonGbp,
      createBundleInformationResponseFromAcbs,
      createFacilityLoanResponseFromService,
      bondRepaymentSchedulesGbp,
      ewcsRepaymentSchedulesGbp,
      gefRepaymentSchedulesGbp,
    };
  }

  private getBaseMessage(facilityIdentifier: UkefId, facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string): NewLoanRequest {
    const loanInstrumentCode = facilityLoan.productTypeId;
    const repaymentSchedules = this.getBondRepaymentSchedules(facilityLoan);

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
      RepaymentScheduleList: repaymentSchedules,
    };
  }

  private getNonGbpDependentFields(facilityLoan: CreateFacilityLoanRequestItem) {
    return {
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
      CustomerUsageNextValuationDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.expiryDate),
      FinancialLockMTMRateIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.financialLockMTMRateIndicator,
      CustomerUsageLockMTMRateIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageLockMTMRateIndicator,
    };
  }

  private getBaseRepaymentSchedule(facilityLoan: CreateFacilityLoanRequestItem) {
    return {
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.REPAYMENT.DEFAULT.involvedParty.partyIdentifier,
      },
      LenderType: {
        LenderTypeCode: PROPERTIES.REPAYMENT.DEFAULT.lenderType.lenderTypeCode,
      },
      AccountSequence: PROPERTIES.REPAYMENT.DEFAULT.accountSequence,
      BillingCalendar: {
        CalendarIdentifier: CALENDAR_IDENTIFIERS.UK,
      },
      LoanBillingFrequencyType: {
        LoanBillingFrequencyTypeCode: facilityLoan.loanBillingFrequencyType,
      },
      NextDueDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
      BillingDueCycleDay: this.dateStringTransformations.getDayFromDateOnlyString(facilityLoan.nextDueDate),
      NextAccrueToDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
      BillingAccrueToCycleDay: this.dateStringTransformations.getDayFromDateOnlyString(facilityLoan.nextDueDate),
      LeadDays: PROPERTIES.REPAYMENT.DEFAULT.leadDays,
      NextDueBusinessDayAdjustmentType: {
        LoanSystemBusinessDayAdjustmentTypeCode: PROPERTIES.REPAYMENT.DEFAULT.nextDueBusinessDayAdjustmentType.loanSystemBusinessDayAdjustmentTypeCode,
      },
      NextAccrueBusinessDayAdjustmentType: {
        LoanSystemBusinessDayAdjustmentTypeCode: PROPERTIES.REPAYMENT.DEFAULT.nextAccrueBusinessDayAdjustmentType.loanSystemBusinessDayAdjustmentTypeCode,
      },
      BillingPeriod: PROPERTIES.REPAYMENT.DEFAULT.billingPeriod,
      CollectionInstructionMethod: {
        CollectionInstructionMethodCode: PROPERTIES.REPAYMENT.DEFAULT.collectionInstructionMethod.collectionInstructionMethodCode,
      },
      BillFormatType: {
        BillFormatTypeCode: PROPERTIES.REPAYMENT.DEFAULT.billFormatType.billFormatTypeCode,
      },
      MailingInstructionType: {
        MailingInstructionTypeCode: PROPERTIES.REPAYMENT.DEFAULT.mailingInstructionType.mailingInstructionTypeCode,
      },
      SpreadToInvestorsIndicator: PROPERTIES.REPAYMENT.DEFAULT.spreadToInvestorsIndicator,
      BalloonPaymentAmount: PROPERTIES.REPAYMENT.DEFAULT.balloonPaymentAmount,
      LoanPrePaymentType: {
        LoanPrePaymentTypeCode: PROPERTIES.REPAYMENT.DEFAULT.loanPrePaymentType.loanPrePaymentTypeCode,
      },
    };
  }

  private getBondRepaymentSchedules(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule[] {
    return [
      {
        ...this.getBaseRepaymentSchedule(facilityLoan),
        PrimaryScheduleIndicator: PROPERTIES.REPAYMENT.DEFAULT.primaryScheduleIndicator,
        BillingScheduleType: {
          BillingScheduleTypeCode: PROPERTIES.REPAYMENT.PAC_BSS.billingScheduleType.billingScheduleTypeCode,
        },
        PercentageOfBalance: PROPERTIES.REPAYMENT.PAC_BSS.percentageOfBalance,
        PaymentAmount: facilityLoan.amount,
        BillingSequenceNumber: PROPERTIES.REPAYMENT.PAC_BSS.billingSequenceNumber,
      },
    ];
  }

  private getEwcsRepaymentSchedules(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule[] {
    return [
      {
        ...this.getBaseRepaymentSchedule(facilityLoan),
        PrimaryScheduleIndicator: PROPERTIES.REPAYMENT.DEFAULT.primaryScheduleIndicator,
        BillingScheduleType: {
          BillingScheduleTypeCode: PROPERTIES.REPAYMENT.INT.billingScheduleType.billingScheduleTypeCode,
        },
        BillingSequenceNumber: PROPERTIES.REPAYMENT.INT.billingSequenceNumber,
      },
      {
        ...this.getBaseRepaymentSchedule(facilityLoan),
        PrimaryScheduleIndicator: PROPERTIES.REPAYMENT.PAC.primaryScheduleIndicator,
        BillingScheduleType: {
          BillingScheduleTypeCode: PROPERTIES.REPAYMENT.PAC.billingScheduleType.billingScheduleTypeCode,
        },
        BalanceCategory: {
          BalanceCategoryCode: PROPERTIES.REPAYMENT.PAC.balanceCategory.balanceCategoryCode,
        },
        PercentageOfBalance: PROPERTIES.REPAYMENT.PAC.percentageOfBalance,
        BillingSequenceNumber: PROPERTIES.REPAYMENT.PAC.billingSequenceNumber,
        NumberOfBillsToPrint: PROPERTIES.REPAYMENT.PAC.numberOfBillsToPrint,
      },
    ];
  }

  private getGefRepaymentSchedules(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule[] {
    return [
      {
        ...this.getBaseRepaymentSchedule(facilityLoan),
        PrimaryScheduleIndicator: PROPERTIES.REPAYMENT.DEFAULT.primaryScheduleIndicator,
        BillingScheduleType: {
          BillingScheduleTypeCode: PROPERTIES.REPAYMENT.PAC.billingScheduleType.billingScheduleTypeCode,
        },
        BalanceCategory: {
          BalanceCategoryCode: PROPERTIES.REPAYMENT.PAC.balanceCategory.balanceCategoryCode,
        },
        PercentageOfBalance: PROPERTIES.REPAYMENT.PAC.percentageOfBalance,
        BillingSequenceNumber: PROPERTIES.REPAYMENT.PAC.billingSequenceNumber,
      },
    ];
  }
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  bundleIdentifier: AcbsBundleId;
}

interface GenerateResult {
  acbsRequestBodyToCreateFacilityLoanGbp: AcbsCreateBundleInformationRequestDto<NewLoanRequest>;
  acbsRequestBodyToCreateFacilityLoanNonGbp: AcbsCreateBundleInformationRequestDto<NewLoanRequest>;
  requestBodyToCreateFacilityLoanGbp: CreateFacilityLoanRequest;
  requestBodyToCreateFacilityLoanNonGbp: CreateFacilityLoanRequest;
  createBundleInformationResponseFromAcbs: AcbsCreateBundleInformationResponseHeadersDto;
  createFacilityLoanResponseFromService: CreateFacilityLoanResponse;
  bondRepaymentSchedulesGbp: RepaymentSchedule[];
  ewcsRepaymentSchedulesGbp: RepaymentSchedule[];
  gefRepaymentSchedulesGbp: RepaymentSchedule[];
}
