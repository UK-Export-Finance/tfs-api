export const ACBSID = {
  PARTY_ID: {
    PREFIX: '00',
    REGEX: /^00\d{6}$/,
  },
  BUNDLE_ID: {
    PREFIX: '0000',
    REGEX: /^0{4}\d{6}$/,
  },
  LOAN_ID: {
    REGEX: /^\d{9}$/,
    LENGTH: 9,
  },
};
