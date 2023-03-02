export const PROPERTIES = {
  GLOBAL: {
    portfolioIdentifier: 'E1',
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
};
