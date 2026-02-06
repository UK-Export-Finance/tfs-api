import { BundleInformationType } from '@ukef/constants/enums/bundle-information-type';

import { COUNTRIES } from './countries.constant';

export const PROPERTIES = {
  GLOBAL: {
    portfolioIdentifier: 'E1',
    servicingQueueIdentifier: 'DCIS',
  },
  COVENANT: {
    DEFAULT: {
      accountOwnerIdentifier: '00000000',
      complianceEvaluationMode: {
        covenantEvaluationModeCode: 'M',
      },
      dateCycleEvaluationMode: {
        covenantEvaluationModeCode: 'M',
      },
      lenderType: {
        covenantLenderTypeCode: '100',
      },
      limitType: {
        covenantLimitTypeCode: '00',
      },
      sectionIdentifier: '00',
      covenantType: {
        covenantTypeCode: '43',
      },
      complianceRule: {
        covenantComplianceRuleCode: 'EQ',
      },
      inComplianceIndicator: true,
      waivedIndicator: false,
    },
  },
  DEAL: {
    DEFAULT: {
      dealOriginationCode: 'C',
      isDealSyndicationIndicator: true,
      dealInitialStatusCode: 'A',
      dealOverallStatusCode: 'A',
      dealTypeCode: '500',
      dealReviewFrequencyTypeCode: ' ',
      previousDealPortfolioIdentifier: '',
      dealLegallyBindingIndicator: false,
      dealUserDefinedList5Code: 'N',
      dealDefaultPaymentInstruction: null,
      dealExternalReferences: '[]',
      portfolioIdentifier: 'E1',
      currencyIsActiveIndicator: true,
      bookingDate: null,
      finalAvailableDate: null,
      isFinalAvailableDateMaximum: true,
      expirationDate: '2050-12-31T00:00:00Z',
      isExpirationDateMaximum: true,
      memoLimitAmount: 0,
      withheldAmount: 0,
      bookingClassCode: 'A',
      memoUsedAmount: 0,
      memoAvailableAmount: 0,
      memoWithheldAmount: 0,
      lineOfficerIdentifier: 'DCIS',
      generalLedgerUnitIdentifier: 'ECGD',
      servicingUnitIdentifier: 'ACBS',
      servicingUnitSectionIdentifier: 'ACBS',
      agentBankPartyIdentifier: '00000000',
      riskCountryCode: COUNTRIES.GBR,
      purposeTypeCode: '   ',
      capitalClassCode: 'A',
      capitalConversionFactorCode: ' ',
      financialFXRate: 1,
      financialFXRateOperand: 'M',
      financialRateFXRateGroup: 'UKRATEGRP',
      financialFrequencyCode: 'M',
      financialBusinessDayAdjustment: 'S',
      financialDueMonthEndIndicator: false,
      financialcalendarIdentifier: 'UK',
      financialLockMTMRateIndicator: true,
      financialNextValuationDate: '2060-12-25T00:00:00Z',
      customerFXRateGroup: 'UKRATEGRP',
      customerFrequencyCode: 'M',
      customerBusinessDayAdjustment: 'S',
      customerDueMonthEndIndicator: false,
      customerCalendarIdentifier: 'UK',
      customerLockMTMRateIndicator: true,
      customerNextValuationDate: '2060-12-25T00:00:00Z',
      limitRevolvingIndicator: true,
      servicingUser: {
        userAcbsIdentifier: 'OPERATIONS',
        userName: 'OPERATIONS',
      },
      administrativeUser: {
        userAcbsIdentifier: 'OPERATIONS',
        userName: 'OPERATIONS',
      },
      creditReviewRiskTypeCode: '04',
      nextReviewDate: '2050-01-01T00:00:00Z',
      isNextReviewDateZero: true,
      officerRiskRatingTypeCode: '99',
      isOfficerRiskDateZero: false,
      isCreditReviewRiskDateZero: true,
      regulatorRiskDate: null,
      isRegulatorRiskDateZero: true,
      multiCurrencyArrangementIndicator: true,
      isUserDefinedDate1Zero: true,
      isUserDefinedDate2Zero: true,
      isUserDefinedDate3Zero: true,
      isUserDefinedDate4Zero: true,
      sharedNationalCredit: '',
      defaultReasonCode: ' ',
      accountStructureCode: 'C',
      lenderTypeCode: '100',
      riskMitigationCode: '',
    },
  },
  DEAL_BORROWING_RESTRICTION: {
    DEFAULT: {
      sequenceNumber: 1,
      restrictGroupCategory: {
        restrictGroupCategoryCode: '36',
      },
      includingIndicator: true,
      includeExcludeAllItemsIndicator: true,
    },
  },
  DEAL_GUARANTEE: {
    DEFAULT: {
      sectionIdentifier: '00',
      guaranteedPercentage: 100,
      lenderType: {
        lenderTypeCode: '100',
      },
      limitType: {
        limitTypeCode: '00',
      },
      guarantorParty: '00000141',
      guaranteeTypeCode: '450',
    },
  },
  PARTY: {
    DEFAULT: {
      partyTypeCode: '100',
      address: {
        addressIdentifier: 'PRM',
        addressName1: 'PRV',
        addressTypeCode: '01',
        countryCode: COUNTRIES.GBR,
      },
      generalLedgerUnitIdentifier: 'ECGD',
      riskRatingCode: '14',
      lineOfficerIdentifier: 'DCIS',
      servicingUnitSectionIdentifier: 'ACBS',
      servicingUnitIdentifier: 'ACBS',
      partyUserDefinedList1Code: '',
      partyUserDefinedList2Code: '',
      partyUserDefinedList3Code: '',
      languageCode: 'ENG',
      partyStatusCode: 'AC',
      watchListReasonCode: '',
    },
  },
  PARTY_EXTERNAL_RATING: {
    DEFAULT: {
      ratingEntityCode: '150',
      probabilityofDefault: 0,
      lossGivenDefault: 0,
      riskWeighting: 0,
      externalRatingNote1: '',
      externalRatingNote2: '',
    },
  },
  FACILITY_INVESTOR: {
    DEFAULT: {
      sectionIdentifier: '00',
      lenderType: {
        lenderTypeCode: '500',
      },
      involvedParty: {
        partyIdentifier: '00000000',
      },
      customerAdvisedIndicator: true,
      facilityStatus: {
        facilityStatusCode: 'A',
      },
      limitRevolvingIndicator: true,
    },
  },
  DEAL_INVESTOR: {
    DEFAULT: {
      sectionIdentifier: '00',
      lenderType: {
        lenderTypeCode: '500',
      },
      involvedParty: {
        partyIdentifier: '00000000',
      },
      dealStatus: {
        dealStatusCode: 'A',
      },
      customerAdvisedIndicator: true,
      userDefinedCode1: 'N',
      limitRevolvingIndicator: true,
      expirationDate: null,
      contractPercentage: 100,
    },
  },
  FACILITY: {
    DEFAULT: {
      GET: {
        compBalPctReserve: 0,
        compBalPctAmount: 0,
      },
      POST: {
        isFinalAvailableDateMaximum: true,
        isExpirationDateMaximum: true,
        bookingClassCode: 'A',
        facilityInitialStatusCode: 'P',
        lineOfficerIdentifier: 'DCIS',
        generalLedgerUnitIdentifier: 'ECGD',
        servicingUnitIdentifier: 'ACBS',
        servicingUnitSectionIdentifier: 'ACBS',
        purposeTypeCode: '   ',
        capitalClassCode: 'A',
        capitalConversionFactorCode: {
          '250': '1',
          '260': '5',
        },
        capitalConversionFactorCodeFallback: '1',
        financialFXRate: 1,
        financialFXRateOperand: 'D',
        financialRateFXRateGroup: 'UKRATEGRP',
        financialFrequencyCode: 'M',
        financialBusinessDayAdjustment: 'S',
        financialDueMonthEndIndicator: false,
        calendarIdentifier: 'UK',
        financialLockMTMRateIndicator: true,
        financialNextValuationDate: '2060-12-25T00:00:00Z',
        customerFXRateGroup: 'UKRATEGRP',
        customerFrequencyCode: 'M',
        customerBusinessDayAdjustment: 'S',
        customerDueMonthEndIndicator: false,
        customerLockMTMRateIndicator: true,
        customerNextValuationDate: '2060-12-25T00:00:00Z',
        limitRevolvingIndicator: true,
        standardReferenceType: '' as const,
        servicingUser: { userAcbsIdentifier: 'OPERATIONS', userName: 'OPERATIONS' },
        administrativeUser: { userAcbsIdentifier: 'OPERATIONS', userName: 'OPERATIONS' },
        isNextReviewDateZero: true,
        isCreditReviewRiskDateZero: true,
        regulatorRiskDate: '',
        isRegulatorRiskDateZero: true,
        multiCurrencyArrangementIndicator: true,
        isUserDefinedDate3Zero: true,
        isUserDefinedDate4Zero: true,
        defaultReasonCode: ' ',
        lenderTypeCode: '100',
        nextReviewDate: '2050-01-01T00:00:00Z',
        isOfficerRiskDateZero: true,
        facilityUserDefinedList3Code: '2',
        probabilityofDefault: 0,
        doubtfulPercent: 0,
        drawUnderTemplateIndicator: false,
        facilityOriginationCode: 'C',
        accountStructureCode: 'B',
        facilityStatusCode: 'D',
        compBalPctReserveUnissued: 75,
        compBalPctReserveIssued: 100,
        riskMitigationCode: '',
      },
    },
  },
  FACILITY_ACTIVATION_TRANSACTION: {
    DEFAULT: {
      initiatingUserName: 'APIUKEF',
      useAPIUserIndicator: false,
      bundleMessageList: {
        type: BundleInformationType.FACILITY_CODE_VALUE_TRANSACTION as const,
        accountOwnerIdentifier: '00000000',
        facilityTransactionCodeValue: { facilityTransactionCodeValueCode: 'A' },
        facilityTransactionType: { typeCode: '2340' },
        isDraftIndicator: false,
        limitType: { limitTypeCode: '00' },
        sectionIdentifier: '00',
      },
    },
  },
  FACILITY_FEE_AMOUNT_TRANSACTION: {
    DEFAULT: {
      initialBundleStatusCode: 3,
      initiatingUserName: 'APIUKEF',
      useAPIUserIndicator: false,
      bundleMessageList: {
        type: 'FacilityFeeAmountTransaction' as const,
        facilityFeeTransactionType: {
          decreaseTypeCode: 2750,
          increaseTypeCode: 2740,
        },
        accountOwnerIdentifier: '00000000',
        isDraftIndicator: false,
        limitType: {
          limitTypeCode: '00',
        },
        sectionIdentifier: '00',
      },
    },
  },
  FACILITY_GUARANTEE: {
    DEFAULT: {
      sectionIdentifier: '00',
      guaranteedPercentage: 100,
      lenderType: {
        lenderTypeCode: '100',
      },
      limitType: {
        limitTypeCode: '00',
      },
    },
  },
  FACILITY_FIXED_FEE: {
    DEFAULT: {
      fixedFeeChargeType: {
        fixedFeeChargeTypeCode: '1',
      },
      description: {
        '250': 'Bond Support Premium',
        '260': 'EWCS Premium',
        '280': 'Financial Guarantee Fee',
      },
      fixedFeeEarningMethod: {
        fixedFeeEarningMethodCode: 'A',
      },
      sectionIdentifier: '00',
      limitType: {
        limitTypeCode: '00',
      },
      involvedParty: {
        partyIdentifier: '00000000',
      },
      leadDays: 1,
      accountingMethodCode: 'A',
      feeStartDateTypeCode: 'A',
      billingFrequencyTypeCode: 'G',
      feeStatusCode: 'A',
      incomeClassCode: 'BPM',
      businessDayAdjustmentTypeCode: 'M',
      accrueToBusinessDayAdjustmentTypeCode: 'M',
      calendarIdentifier: 'UK',
      financialCurrentFXRate: 1,
      financialCurrentFXRateOperand: 'D',
    },
  },
  FACILITY_LOAN: {
    DEFAULT: {
      initiatingUserName: 'APIUKEF',
      servicingUserAccountIdentifier: 'APIUKEF',
      useAPIUserIndicator: false,
      initialBundleStatusCode: 3,
      messageType: BundleInformationType.NEW_LOAN_REQUEST as const,
      accountOwnerIdentifier: '00000000',
      sectionIdentifier: '00',
      servicingUser: {
        userAcbsIdentifier: 'OPERATIONS',
        userName: 'OPERATIONS',
      },
      administrativeUser: {
        userAcbsIdentifier: 'OPERATIONS',
        userName: 'OPERATIONS',
      },
      servicingUnit: {
        servicingUnitIdentifier: 'ACBS',
      },
      servicingUnitSection: {
        servicingUnitSectionIdentifier: 'ACBS',
      },
      closureType: {
        closureTypeCode: 'B',
      },
      agentPartyIdentifier: '00000000',
      agentAddressIdentifier: 'PRM',
      interestRateType: {
        interestRateTypeCode: 'INS',
      },
      bookingType: {
        loanBookingTypeCode: 'A',
      },
      loanReviewFrequencyType: {
        loanReviewFrequencyTypeCode: 'A',
      },
      currentRiskOfficerIdentifier: 'DCIS',
      loanAdvanceType: {
        loanAdvanceTypeCode: 'D',
      },
      generalLedgerUnit: {
        generalLedgerUnitIdentifier: 'ECGD',
      },
      cashEventList: {
        paymentInstructionCode: '',
        cashOffsetTypeCode: '02',
        dDAAccount: '',
        cashReferenceIdentifier: '',
      },
      financialRateGroup: 'UKRATEGRP',
      customerUsageRateGroup: 'UKRATEGRP',
      financialFrequency: {
        usageFrequencyTypeCode: 'M',
      },
      customerUsageFrequency: {
        usageFrequencyTypeCode: 'M',
      },
      financialBusinessDayAdjustment: {
        businessDayAdjustmentTypeCode: 'S',
      },
      customerUsageBusinessDayAdjustment: {
        businessDayAdjustmentTypeCode: 'S',
      },
      financialCalendar: {
        calendarIdentifier: 'UK',
      },
      customerUsageCalendar: {
        calendarIdentifier: 'UK',
      },
      financialLockMTMRateIndicator: true,
      customerUsageLockMTMRateIndicator: true,
      securedType: {
        loanSecuredTypeCode: 'N',
      },
      accrualScheduleList: {
        accrualCategory: {
          accrualCategoryCode: {
            pac: 'PAC01',
            ctl: 'CTL01',
          },
        },
      },
    },
  },
  FACILITY_AMOUNT_TRANSACTION: {
    DEFAULT: {
      servicingQueueIdentifier: 'DCIS',
      portfolioIdentifier: 'E1',
      initialBundleStatusCode: 3,
      initiatingUserName: 'APIUKEF',
      useAPIUserIndicator: false,
      bundleMessageList: {
        type: BundleInformationType.FACILITY_AMOUNT_TRANSACTION as const,
        accountOwnerIdentifier: '00000000',
        isDraftIndicator: false,
        limitType: {
          limitTypeCode: '00',
        },
        sectionIdentifier: '00',
        lenderTypeCode: '100',
      },
    },
  },
  LOAN_AMOUNT_AMENDMENT: {
    DEFAULT: {
      initialBundleStatusCode: 3,
      initiatingUserName: 'APIUKEF',
      useAPIUserIndicator: false,
      bundleMessageList: {
        type: BundleInformationType.LOAN_ADVANCE_TRANSACTION as const,
        cashOffsetTypeCode: '02',
        isDraftIndicator: false,
        transactionTypeCode: {
          increase: '9040',
          decrease: '9050',
        },
      },
    },
  },
  REPAYMENT: {
    DEFAULT: {
      primaryScheduleIndicator: true,
      involvedParty: {
        partyIdentifier: '00000000',
      },
      lenderType: {
        lenderTypeCode: '100',
      },
      accountSequence: '1',
      leadDays: 5,
      nextDueBusinessDayAdjustmentType: {
        loanSystemBusinessDayAdjustmentTypeCode: 'M',
      },
      nextAccrueBusinessDayAdjustmentType: {
        loanSystemBusinessDayAdjustmentTypeCode: 'M',
      },
      billingPeriod: 0,
      collectionInstructionMethod: {
        collectionInstructionMethodCode: '',
      },
      billFormatType: {
        billFormatTypeCode: '',
      },
      mailingInstructionType: {
        mailingInstructionTypeCode: '',
      },
      spreadToInvestorsIndicator: true,
      balloonPaymentAmount: 0,
      loanPrePaymentType: {
        loanPrePaymentTypeCode: 2,
      },
    },
    INT: {
      billingScheduleType: {
        billingScheduleTypeCode: 'A',
      },
      billingSequenceNumber: 2,
    },
    PAC: {
      primaryScheduleIndicator: false,
      billingScheduleType: {
        billingScheduleTypeCode: 'N',
      },
      balanceCategory: {
        balanceCategoryCode: 'PAC',
      },
      numberOfBillsToPrint: 99999,
      percentageOfBalance: 100,
      billingSequenceNumber: 1,
    },
    PAC_BSS: {
      billingScheduleType: {
        billingScheduleTypeCode: 'B',
      },
      numberOfBillsToPrint: 99999,
      percentageOfBalance: 0,
      billingSequenceNumber: 1,
    },
  },
  ACCRUAL: {
    DEFAULT: {
      involvedParty: {
        partyIdentifier: '00000000',
      },
      accountSequence: '1',
      lenderType: {
        lenderTypeCode: '100',
      },
      baseRate: 0,
      reserveRate: 0,
      costOfFundsRate: 0,
      percentageOfRate: 100,
      percentOfBaseBalance: 100,
      lowBalancePercent: 0,
      cappedAccrualRate: 0,
      spreadToInvestorsIndicator: true,
    },
    PAC: {
      scheduleIdentifier: 'PAC1',
      accrualCategory: {
        accrualCategoryCode: 'PAC01',
      },
      rateCalculationMethod: {
        rateCalculationMethodCode: 'A',
      },
    },
    INT_RFR: {
      scheduleIdentifier: 'INT1',
      accrualCategory: {
        accrualCategoryCode: 'CTL01',
      },
      businessDayCalendar: {
        calendarIdentifier: 'UK',
      },
      rateCalculationMethod: {
        rateCalculationMethodCode: 'H',
      },
      indexRateChangeFrequency: {
        indexRateChangeFrequencyCode: 'A',
      },
      indexRateChangeTiming: {
        indexRateChangeTimingCode: 'A',
      },
      indexedRateIndicator: true,
      nextDueBusinessDayAdjustmentType: {
        businessDayAdjustmentTypeCode: 'M',
      },
      rateSetLeadDays: 0,
      accrualScheduleIBORDetails: {
        isDailyRFR: true,
        rFRCalculationMethod: {
          rFRCalculationMethodCode: 2,
        },
        compoundingDateType: {
          compoundingDateTypeCode: 'B',
        },
        calculationFeature: {
          calculationFeatureCode: 1,
        },
        rateSetLagDays: 5,
        lagDaysType: {
          compoundingDateTypeCode: 'B',
        },
        calendar: {
          calendarIdentifier: 'UK',
        },
        nextRatePeriodBusinessDayAdjustment: {
          nextRatePeriodBusinessDayAdjustmentCode: 'M',
        },
        ratePeriodResetFrequency: {
          ratePeriodResetFrequencyCode: 'E',
        },
        frequencyPeriod: 0,
      },
    },
    INT_NON_RFR: {
      scheduleIdentifier: 'INT1',
      accrualCategory: {
        accrualCategoryCode: 'CTL01',
      },
      businessDayCalendar: {
        calendarIdentifier: 'UK',
      },
      rateCalculationMethod: {
        rateCalculationMethodCode: 'A',
      },
      indexRateChangeFrequency: {
        indexRateChangeFrequencyCode: 'A',
      },
      indexRateChangeTiming: {
        indexRateChangeTimingCode: 'L',
      },
      indexedRateIndicator: true,
      nextDueBusinessDayAdjustmentType: {
        businessDayAdjustmentTypeCode: 'M',
      },
      rateSetLeadDays: 0,
    },
  },
};
