import { UkefId } from '@ukef/helpers';

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

export const GIFT_EXAMPLES = {
  FACILITY: {
    AVAILABLE_AMOUNT: 3000000,
    CREATED_DATE_TIME: new Date().toISOString(),
    CURRENCY: 'USD',
    DEAL_ID,
    DRAWN_AMOUNT: 2000000,
    EFFECTIVE_DATE: '2025-01-01',
    END_OF_COVER_DATE: '2025-03-01',
    EXPIRY_DATE: '2025-02-01',
    FACILITY_AMOUNT: 1000000,
    FACILITY_ID,
    FACILITY_NAME: 'Amazing facility',
    IS_REVOLVING: true,
    IS_DRAFT: false,
    OBLIGOR_URN: '01234567',
    STREAM_ID: '7d915bfa-0069-4aaa-92c5-013925f019a1',
    STREAM_VERSION: 1,
  },
};
