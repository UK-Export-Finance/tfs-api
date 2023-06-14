import { ENUMS, PROPERTIES } from '@ukef/constants';
import { CALENDAR_IDENTIFIERS } from '@ukef/constants/calendar-identifiers.constant';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { LOAN_RATE_INDEX } from '@ukef/constants/loan-rate-index.constant';
import { AcbsBundleId, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { AccrualScheduleExtended } from '@ukef/modules/acbs/dto/bundle-actions/accrual-schedule.interface';
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
    return {
      postingDate: this.valueGenerator.dateOnlyString(),
      borrowerPartyIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
      productTypeId: ENUMS.PRODUCT_TYPE_IDS.BSS,
      productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.BOND,
      currency: CURRENCIES.GBP,
      dealCustomerUsageRate: 0.123,
      dealCustomerUsageOperationType: this.valueGenerator.enumValue(ENUMS.OPERATION_TYPE_CODES),
      amount: 123.45,
      issueDate: this.valueGenerator.dateOnlyString(),
      expiryDate: this.valueGenerator.dateOnlyString(),
      nextDueDate: this.valueGenerator.dateOnlyString(),
      loanBillingFrequencyType: this.valueGenerator.enumValue(ENUMS.FEE_FREQUENCY_TYPES),
      spreadRate: this.valueGenerator.nonnegativeFloat(),
      spreadRateCtl: this.valueGenerator.nonnegativeFloat(),
      yearBasis: this.valueGenerator.enumValue(ENUMS.YEAR_BASIS_CODES),
      indexRateChangeFrequency: this.valueGenerator.enumValue(ENUMS.FEE_FREQUENCY_TYPES),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: CreateFacilityLoanRequestItem[],
    { facilityIdentifier, bundleIdentifier }: GenerateOptions,
  ): GenerateResult {
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

    const requestBodyToCreateFacilityLoanGbp: CreateFacilityLoanRequest = values.map((value) => ({
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
      spreadRate: value.spreadRate,
      spreadRateCtl: value.spreadRateCtl,
      yearBasis: value.yearBasis,
      indexRateChangeFrequency: value.indexRateChangeFrequency,
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
    const bondAndGefAccrualSchedulesGbp = this.getBondAndGefAccrualSchedules(firstFacilityLoan, acbsEffectiveDate);
    const ewcsAccrualSchedulesUsd = this.getEwcsAccrualSchedulesUsd(firstFacilityLoan, acbsEffectiveDate);
    const ewcsAccrualSchedulesGbp = this.getEwcsAccrualSchedulesGbp(firstFacilityLoan, acbsEffectiveDate, effectiveDate);

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
      bondAndGefAccrualSchedulesGbp,
      ewcsAccrualSchedulesUsd,
      ewcsAccrualSchedulesGbp,
    };
  }

  private getBaseMessage(facilityIdentifier: UkefId, facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string): NewLoanRequest {
    const loanInstrumentCode = facilityLoan.productTypeId;
    const repaymentSchedules = this.getBondRepaymentSchedules(facilityLoan);
    const accrualSchedules = this.getBondAndGefAccrualSchedules(facilityLoan, acbsEffectiveDate);

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
      AccrualScheduleList: accrualSchedules,
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

  private getBaseAccrualSchedule(facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string) {
    return {
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.ACCRUAL.DEFAULT.involvedParty.partyIdentifier,
      },
      AccountSequence: PROPERTIES.ACCRUAL.DEFAULT.accountSequence,
      LenderType: {
        LenderTypeCode: PROPERTIES.ACCRUAL.DEFAULT.lenderType.lenderTypeCode,
      },
      EffectiveDate: acbsEffectiveDate,
      YearBasis: {
        YearBasisCode: facilityLoan.yearBasis,
      },
      BaseRate: PROPERTIES.ACCRUAL.DEFAULT.baseRate,
      ReserveRate: PROPERTIES.ACCRUAL.DEFAULT.reserveRate,
      CostOfFundsRate: PROPERTIES.ACCRUAL.DEFAULT.costOfFundsRate,
      PercentageOfRate: PROPERTIES.ACCRUAL.DEFAULT.percentageOfRate,
      PercentOfBaseBalance: PROPERTIES.ACCRUAL.DEFAULT.percentOfBaseBalance,
      LowBalancePercent: PROPERTIES.ACCRUAL.DEFAULT.lowBalancePercent,
      CappedAccrualRate: PROPERTIES.ACCRUAL.DEFAULT.cappedAccrualRate,
      SpreadToInvestorsIndicator: PROPERTIES.ACCRUAL.DEFAULT.spreadToInvestorsIndicator,
    };
  }

  private getBondAndGefAccrualSchedules(facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string): AccrualScheduleExtended[] {
    return [this.getPacAccrualSchedule(facilityLoan, acbsEffectiveDate)];
  }

  private getPacAccrualSchedule(facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string): AccrualScheduleExtended {
    return {
      ...this.getBaseAccrualSchedule(facilityLoan, acbsEffectiveDate),
      ScheduleIdentifier: PROPERTIES.ACCRUAL.PAC.scheduleIdentifier,
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.ACCRUAL.PAC.accrualCategory.accrualCategoryCode,
      },
      RateCalculationMethod: {
        RateCalculationMethodCode: PROPERTIES.ACCRUAL.PAC.rateCalculationMethod.rateCalculationMethodCode,
      },
      SpreadRate: facilityLoan.spreadRate,
    };
  }

  private getEwcsAccrualSchedulesUsd(facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string): AccrualScheduleExtended[] {
    return [
      this.getPacAccrualSchedule(facilityLoan, acbsEffectiveDate),
      {
        ...this.getBaseAccrualSchedule(facilityLoan, acbsEffectiveDate),
        ScheduleIdentifier: PROPERTIES.ACCRUAL.INT_NON_RFR.scheduleIdentifier,
        AccrualCategory: {
          AccrualCategoryCode: PROPERTIES.ACCRUAL.INT_NON_RFR.accrualCategory.accrualCategoryCode,
        },
        RateCalculationMethod: {
          RateCalculationMethodCode: PROPERTIES.ACCRUAL.INT_NON_RFR.rateCalculationMethod.rateCalculationMethodCode,
        },
        BusinessDayCalendar: {
          CalendarIdentifier: PROPERTIES.ACCRUAL.INT_NON_RFR.businessDayCalendar.calendarIdentifier,
        },
        SpreadRate: facilityLoan.spreadRateCtl,
        IndexRateChangeFrequency: {
          IndexRateChangeFrequencyCode: facilityLoan.indexRateChangeFrequency,
        },
        IndexRateChangeTiming: {
          IndexRateChangeTimingCode: PROPERTIES.ACCRUAL.INT_NON_RFR.indexRateChangeTiming.indexRateChangeTimingCode,
        },
        LoanRateIndex: {
          LoanRateIndexCode: LOAN_RATE_INDEX.USD,
        },
        IndexedRateIndicator: PROPERTIES.ACCRUAL.INT_NON_RFR.indexedRateIndicator,
        NextDueBusinessDayAdjustmentType: {
          BusinessDayAdjustmentTypeCode: PROPERTIES.ACCRUAL.INT_NON_RFR.nextDueBusinessDayAdjustmentType.businessDayAdjustmentTypeCode,
        },
        NextRateSetDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
        RateNextEffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
        RateSetLeadDays: PROPERTIES.ACCRUAL.INT_NON_RFR.rateSetLeadDays,
      },
    ];
  }

  private getEwcsAccrualSchedulesGbp(facilityLoan: CreateFacilityLoanRequestItem, acbsEffectiveDate: string, effectiveDate: string): AccrualScheduleExtended[] {
    const nextRatePeriod = this.dateStringTransformations.getDatePlusThreeMonths(effectiveDate);
    return [
      this.getPacAccrualSchedule(facilityLoan, acbsEffectiveDate),
      {
        ...this.getBaseAccrualSchedule(facilityLoan, acbsEffectiveDate),
        ScheduleIdentifier: PROPERTIES.ACCRUAL.INT_RFR.scheduleIdentifier,
        AccrualCategory: {
          AccrualCategoryCode: PROPERTIES.ACCRUAL.INT_RFR.accrualCategory.accrualCategoryCode,
        },
        RateCalculationMethod: {
          RateCalculationMethodCode: PROPERTIES.ACCRUAL.INT_RFR.rateCalculationMethod.rateCalculationMethodCode,
        },
        SpreadRate: facilityLoan.spreadRateCtl,
        IndexRateChangeTiming: {
          IndexRateChangeTimingCode: PROPERTIES.ACCRUAL.INT_RFR.indexRateChangeTiming.indexRateChangeTimingCode,
        },
        LoanRateIndex: {
          LoanRateIndexCode: LOAN_RATE_INDEX.OTHER,
        },
        IndexedRateIndicator: PROPERTIES.ACCRUAL.INT_RFR.indexedRateIndicator,
        RateSetLeadDays: PROPERTIES.ACCRUAL.INT_RFR.rateSetLeadDays,
        AccrualScheduleIBORDetails: {
          IsDailyRFR: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.isDailyRFR,
          RFRCalculationMethod: {
            RFRCalculationMethodCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.rFRCalculationMethod.rFRCalculationMethodCode,
          },
          CompoundingDateType: {
            CompoundingDateTypeCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.compoundingDateType.compoundingDateTypeCode,
          },
          CalculationFeature: {
            CalculationFeatureCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.calculationFeature.calculationFeatureCode,
          },
          NextRatePeriod: nextRatePeriod,
          UseObservationShiftIndicator: facilityLoan.currency === CURRENCIES.EUR,
          RateSetLagDays: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.rateSetLagDays,
          LagDaysType: {
            CompoundingDateTypeCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.compoundingDateType.compoundingDateTypeCode,
          },
          Calendar: {
            CalendarIdentifier: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.calendar.calendarIdentifier,
          },
          NextRatePeriodBusinessDayAdjustment: {
            NextRatePeriodBusinessDayAdjustmentCode:
              PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.nextRatePeriodBusinessDayAdjustment.nextRatePeriodBusinessDayAdjustmentCode,
          },
          RatePeriodResetFrequency: {
            RatePeriodResetFrequencyCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.ratePeriodResetFrequency.ratePeriodResetFrequencyCode,
          },
          FrequencyPeriod: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.frequencyPeriod,
        },
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
  bondAndGefAccrualSchedulesGbp: AccrualScheduleExtended[];
  ewcsAccrualSchedulesUsd: AccrualScheduleExtended[];
  ewcsAccrualSchedulesGbp: AccrualScheduleExtended[];
}
