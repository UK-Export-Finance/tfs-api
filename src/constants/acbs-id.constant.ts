export const ACBSID = {
  // Prefix is used for 8 digit id (Party/Customer)
  PARTY_ID: {
    PREFIX: '00',
    REGEX: /^00\d{6}$/,
  },
  BUNDLE_ID: {
    PREFIX: '0000',
    REGEX: /^0{4}\d{6}$/,
  },
};
