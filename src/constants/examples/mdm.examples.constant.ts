const ACCRUAL_FREQUENCY_CODES = {
  FREQ12MON: {
    code: 'FREQ12MON',
    name: 'Annually',
  },
  FREQ1MON: {
    code: 'FREQ1MON',
    name: 'Monthly',
  },
  FREQ3MON: {
    code: 'FREQ3MON',
    name: 'Quarterly',
  },
};

const ACCRUAL_SCHEDULE_TYPE_CODES = {
  CTL02: {
    code: 'CTL02',
    name: 'Contractual Interest Non-Indexed Floating Rate',
  },
  CTL03: {
    code: 'CTL03',
    name: 'Contractual Interest Indexed Floating Rate',
  },
  PAC01: {
    code: 'PAC01',
    name: 'Premium Accrual',
  },
};

const OBLIGATION_SUBTYPES = {
  OST001: {
    type: 'Obligation Sub-Type',
    typeCode: 'obligationSubtype',
    code: 'OST001',
    description: 'BIP Advance Payment Bond',
    isActive: true,
  },
  OST009: {
    type: 'Obligation Sub-Type',
    typeCode: 'obligationSubtype',
    code: 'OST009',
    description: 'EXIP Cash',
    isActive: true,
  },
  OST012: {
    type: 'Obligation Sub-Type',
    typeCode: 'obligationSubtype',
    code: 'OST012',
    description: 'BSS Advance Payment Guarantee',
    isActive: true,
  },
};

const OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES = {
  OST001: {
    ...OBLIGATION_SUBTYPES.OST001,
    productTypeCode: 'PRT001',
  },
  OST009: {
    ...OBLIGATION_SUBTYPES.OST009,
    productTypeCode: 'PRT002',
  },
  OST012: {
    ...OBLIGATION_SUBTYPES.OST012,
    productTypeCode: 'PRT003',
  },
};

export const MDM_EXAMPLES = {
  ACCRUAL_FREQUENCY_CODES,
  ACCRUAL_SCHEDULE_TYPE_CODES,
  OBLIGATION_SUBTYPES,
  OBLIGATION_SUBTYPES_RESPONSE_DATA: Object.values(OBLIGATION_SUBTYPES),
  OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES,
  OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES_RESPONSE_DATA: Object.values(OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES),
};
