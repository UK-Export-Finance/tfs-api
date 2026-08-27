import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityMultipleAmendmentsWithoutQueueUrl,
  approveStatusUrl,
  facilityAmendmentUrl,
  facilityUrl,
  facilityWorkPackageUrl,
  mockResponses,
  mockWorkPackageId,
  obligationAmendmentUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_INCREASE_AMOUNT },
} = GIFT;

describe('POST /gift/facility/:facilityId/multiple-amendments/without-queue - error handling', () => {
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

  describe('GIFT "create work package - configuration event" endpoint', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with the GIFT error`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

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
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toStrictEqual(mockResponses.badRequest);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response with the GIFT error`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

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
        expect(status).toBe(HttpStatus.UNAUTHORIZED);
        expect(body).toStrictEqual(mockResponses.unauthorized);
      });
    });

    describe(`when a ${HttpStatus.FORBIDDEN} response is returned`, () => {
      it(`should return a ${HttpStatus.FORBIDDEN} response with the GIFT error`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.FORBIDDEN, mockResponses.forbidden);

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
        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(body).toStrictEqual(mockResponses.forbidden);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response with the GIFT error`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.internalServerError);

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
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });

  describe('GIFT "approve work package status" endpoint', () => {
    describe(`when a prior amendment step returns ${HttpStatus.BAD_REQUEST}`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response and delete the work package`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.OK);

        nock(GIFT_API_URL).delete(`${GIFT.PATH.WORK_PACKAGE}/${mockWorkPackageId}`).reply(HttpStatus.NO_CONTENT);

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
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toStrictEqual(mockResponses.badRequest);
      });
    });

    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response with the GIFT error`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

        nock(GIFT_API_URL).post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

        nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).delete(`${GIFT.PATH.WORK_PACKAGE}/${mockWorkPackageId}`).reply(HttpStatus.NO_CONTENT);

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
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response with the GIFT error`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

        nock(GIFT_API_URL).post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

        nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.internalServerError);

        nock(GIFT_API_URL).delete(`${GIFT.PATH.WORK_PACKAGE}/${mockWorkPackageId}`).reply(HttpStatus.NO_CONTENT);

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
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(body).toStrictEqual(mockResponses.internalServerError);
      });
    });
  });
});
