import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY },
} = GIFT;

const [firstRepaymentProfile] = EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.repaymentProfiles;

const [firstAllocation, secondAllocation] = firstRepaymentProfile.allocations;

describe('POST /gift/facility - validation - repayment profiles', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    jest.resetAllMocks();

    nock.abortPendingRequests();
    nock.cleanAll();
  });

  describe(`when a single repayment profile's allocation dueDate is NOT unique`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with a validation error`, async () => {
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        repaymentProfiles: [
          {
            ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.repaymentProfiles[0],
            allocations: [firstAllocation, { ...secondAllocation, dueDate: firstAllocation.dueDate }],
          },
        ],
      };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [`repaymentProfile[].allocation[] dueDate's must be unique`],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when multiple repayment profile's allocation dueDate's are NOT unique`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with a validation error`, async () => {
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        repaymentProfiles: [
          {
            ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.repaymentProfiles[0],
            allocations: [firstAllocation, { ...secondAllocation, dueDate: firstAllocation.dueDate }],
          },
          {
            ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.repaymentProfiles[1],
            allocations: [firstAllocation, { ...secondAllocation, dueDate: firstAllocation.dueDate }],
          },
        ],
      };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [`repaymentProfile[].allocation[] dueDate's must be unique`],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });
});
