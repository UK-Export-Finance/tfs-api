import { REGEX } from './regex/index';

export const ACBSID = {
  PARTY_ID: {
    PREFIX: '00',
    REGEX: REGEX.ACBS_PARTY_ID,
  },
  BUNDLE_ID: {
    PREFIX: '0000',
    REGEX: REGEX.ACBS_BUNDLE_ID,
  },
  LOAN_ID: {
    REGEX: REGEX.ACBS_LOAN_ID,
    LENGTH: 9,
  },
};
