export const PROPERTIES = {
  GLOBAL: {
    portfolioIdentifier: 'E1',
  },
  DEAL: {
    DEFAULTS: {
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
      riskCountryCode: 'GBR',
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
        countryCode: 'GBR',
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
};
