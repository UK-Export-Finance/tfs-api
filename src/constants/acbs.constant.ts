export const ACBS = {
  AUTHENTICATION: {
    SESSION_ID_COOKIE_NAME: 'JSESSIONID',
  },
  // Allow ASCII ranges 32-126,160-180,182-254, excluded µ (181) and ÿ (255),
  ALLOWED_CHARACTERS_REGEX: /[\x20-\x7E\xA0-\xB4\xB6-\xFE]*/g,
  // Allow characters that are not blacklisted by ACBS.
  URL_ALLOWED_CHARACTERS_REGEX: /[^&%*?<>#/\\:]/g,
};
