import { HttpStatus } from '@nestjs/common';
import { AMEND_FACILITY_PREFIX_TYPES, GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityMultipleAmendmentsWithoutQueueUrl,
  approveStatusUrl,
  facilityAmendmentUrl,
  facilityUrl,
  facilityWorkPackageUrl,
  mockFacilityId,
  mockResponses,
  mockWorkPackageId,
  obligationAmendmentUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

describe('POST /gift/facility/:facilityId/multiple-amendments/without-queue', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {},
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => {
      const mockPayload = {
        amendments: [
          {
            amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
            amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
          },
        ],
      };

      return api.postWithoutAuth(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload, incorrectAuth?.headerName, incorrectAuth?.headerValue);
    },
  });

  describe('when a single amendment is provided', () => {
    describe(`when the payload is valid and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and the created amendment`, async () => {
        // Arrange
        const callOrder: string[] = [];

        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL)
          .post(facilityWorkPackageUrl)
          .reply(() => {
            callOrder.push('workPackage');

            return [HttpStatus.CREATED, mockResponses.workPackageCreation];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('facilityAmendment');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('obligationAmendment');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(approveStatusUrl)
          .reply(() => {
            callOrder.push('approveStatus');

            return [HttpStatus.OK, mockResponses.approveStatus];
          });

        const mockPayload = {
          amendments: [
            {
              amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
              amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
            },
          ],
        };

        // Act
        const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
        expect(body).toStrictEqual({
          ...mockResponses.approveStatus,
          isApproved: true,
        });

        expect(callOrder).toStrictEqual(['workPackage', 'facilityAmendment', 'obligationAmendment', 'approveStatus']);
      });
    });
  });

  describe('when multiple amendments are provided', () => {
    describe('when amendments include INCREASE_AMOUNT and DECREASE_AMOUNT', () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and all created amendments`, async () => {
        // Arrange
        const callOrder: string[] = [];

        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL)
          .post(facilityWorkPackageUrl)
          .reply(() => {
            callOrder.push('workPackage');

            return [HttpStatus.CREATED, mockResponses.workPackageCreation];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('facilityAmendmentIncrease');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('obligationAmendmentIncrease');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(obligationAmendmentUrl(AMEND_FACILITY_DECREASE_AMOUNT))
          .reply(() => {
            callOrder.push('obligationAmendmentDecrease');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_DECREASE_AMOUNT))
          .reply(() => {
            callOrder.push('facilityAmendmentDecrease');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(approveStatusUrl)
          .reply(() => {
            callOrder.push('approveStatus');

            return [HttpStatus.OK, mockResponses.approveStatus];
          });

        const mockPayload = {
          amendments: [
            {
              amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
              amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
            },
            {
              amendmentType: AMEND_FACILITY_DECREASE_AMOUNT,
              amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.DECREASE_AMOUNT,
            },
          ],
        };

        // Act
        const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
        expect(body).toStrictEqual({
          ...mockResponses.approveStatus,
          isApproved: true,
        });

        expect(callOrder).toStrictEqual([
          'workPackage',
          'facilityAmendmentIncrease',
          'obligationAmendmentIncrease',
          'obligationAmendmentDecrease',
          'facilityAmendmentDecrease',
          'approveStatus',
        ]);
      });
    });

    describe('when amendments include INCREASE_AMOUNT and REPLACE_EXPIRY_DATE', () => {
      it(`should return a ${HttpStatus.CREATED} response with a facility and all created amendments`, async () => {
        // Arrange
        const callOrder: string[] = [];

        const baseUrl = `${GIFT.PATH.FACILITY}/${mockFacilityId}${GIFT.PATH.WORK_PACKAGE}/${mockWorkPackageId}${GIFT.PATH.CONFIGURATION_EVENT}`;

        const replaceMaturityDateUrl = `${baseUrl}/${AMEND_FACILITY_PREFIX_TYPES.AMEND_OBLIGATION}ReplaceMaturityDate`;
        const replaceFirstCycleAccrualEndDateUrl = `${baseUrl}/${AMEND_FACILITY_PREFIX_TYPES.AMEND_ACCRUAL_SCHEDULE}${GIFT.AMEND_FACILITY_TYPES_GIFT.AMEND_ACCRUAL_SCHEDULE_REPLACE_FIRST_CYCLE_ACCRUAL_END_DATE}`;

        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [
              {
                id: 'obligation-1',
                maturityDateFollowsFacility: false,
                accrualSchedules: [{ accrualScheduleId: 501 }],
              },
            ],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL)
          .post(facilityWorkPackageUrl)
          .reply(() => {
            callOrder.push('workPackage');

            return [HttpStatus.CREATED, mockResponses.workPackageCreation];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('facilityAmendmentIncrease');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT))
          .reply(() => {
            callOrder.push('obligationAmendmentIncrease');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(facilityAmendmentUrl(AMEND_FACILITY_REPLACE_EXPIRY_DATE))
          .reply(() => {
            callOrder.push('facilityAmendmentReplaceExpiry');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(replaceMaturityDateUrl)
          .reply(() => {
            callOrder.push('replaceMaturityDate');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(replaceFirstCycleAccrualEndDateUrl)
          .reply(() => {
            callOrder.push('replaceFirstCycleAccrualEndDate');

            return [HttpStatus.CREATED, mockResponses.facilityAmendment];
          });

        nock(GIFT_API_URL)
          .post(approveStatusUrl)
          .reply(() => {
            callOrder.push('approveStatus');

            return [HttpStatus.OK, mockResponses.approveStatus];
          });

        const mockPayload = {
          amendments: [
            {
              amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
              amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
            },
            {
              amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
              amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
            },
          ],
        };

        // Act
        const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.CREATED);
        expect(body).toStrictEqual({
          ...mockResponses.approveStatus,
          isApproved: true,
        });

        expect(callOrder).toStrictEqual([
          'workPackage',
          'facilityAmendmentIncrease',
          'obligationAmendmentIncrease',
          'facilityAmendmentReplaceExpiry',
          'replaceMaturityDate',
          'replaceFirstCycleAccrualEndDate',
          'approveStatus',
        ]);
      });
    });
  });
});
