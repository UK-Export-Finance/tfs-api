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
