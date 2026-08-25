import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityAmendmentWithoutQueueUrl,
  approveStatusUrl,
  facilityAmendmentUrl,
  facilityUrl,
  facilityWorkPackageUrl,
  mockResponses,
  obligationAmendmentUrl,
  workPackageUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

describe('POST /gift/facility/:facilityId/amendment - error handling', () => {
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

  beforeEach(() => {
    // Arrange
    nock(GIFT_API_URL)
      .persist()
      .get(facilityUrl)
      .reply(HttpStatus.OK, {
        expiryDate: '2035-01-01',
        obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
        riskDetails: {
          facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
        },
      });

    nock(GIFT_API_URL).persist().post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);

    nock(GIFT_API_URL).persist().post(obligationAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);
  });

  describe('GIFT "create work package - configuration event" endpoint', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = mockResponses.badRequest;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned`, () => {
      it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.UNAUTHORIZED);

        const expected = mockResponses.unauthorized;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.FORBIDDEN} response is returned`, () => {
      it(`should return a ${HttpStatus.FORBIDDEN} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.FORBIDDEN, mockResponses.forbidden);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.FORBIDDEN);

        const expected = mockResponses.forbidden;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.internalServerError);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an otherwise unacceptable response is returned', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.iAmATeapot);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });
  });

  describe('GIFT "approve work package status" endpoint', () => {
    describe(`when a prior amount amendment step returns ${HttpStatus.BAD_REQUEST}`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response and not call the approve endpoint`, async () => {
        // Arrange
        nock.cleanAll();

        nock(GIFT_API_URL)
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            expiryDate: '2035-01-01',
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).delete(workPackageUrl).reply(HttpStatus.NO_CONTENT);

        const approveStatusScope = nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toStrictEqual(mockResponses.badRequest);
        expect(approveStatusScope.isDone()).toBe(false);
      });
    });

    describe(`when a prior replace expiry date amendment step returns ${HttpStatus.BAD_REQUEST}`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response and not call the approve endpoint`, async () => {
        // Arrange
        nock(GIFT_API_URL)
          .persist()
          .get(facilityUrl)
          .reply(HttpStatus.OK, {
            expiryDate: '2035-01-01',
            obligations: [{ id: 'obligation-1', maturityDateFollowsFacility: true }],
            riskDetails: {
              facilityCategoryCode: GIFT.FACILITY_CATEGORY_CODES.CASH,
            },
          });

        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().post(facilityAmendmentUrl(AMEND_FACILITY_REPLACE_EXPIRY_DATE)).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        const approveStatusScope = nock(GIFT_API_URL).post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);

        const payload = {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, payload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toStrictEqual(mockResponses.badRequest);
        expect(approveStatusScope.isDone()).toBe(false);
      });
    });

    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned`, () => {
      it(`should return an ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        nock(GIFT_API_URL).persist().delete(workPackageUrl).reply(HttpStatus.NO_CONTENT, mockResponses.noContent);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.FORBIDDEN} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.FORBIDDEN, mockResponses.forbidden);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.internalServerError);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an otherwise unacceptable response is returned', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.iAmATeapot);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });
  });

  describe('GIFT "delete work package" endpoint', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityAmendmentUrl()).reply(HttpStatus.BAD_REQUEST, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().delete(workPackageUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityAmendmentUrl()).reply(HttpStatus.BAD_REQUEST, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().delete(workPackageUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.FORBIDDEN} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityAmendmentUrl()).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().delete(workPackageUrl).reply(HttpStatus.FORBIDDEN, mockResponses.forbidden);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityAmendmentUrl()).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().delete(workPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.internalServerError);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an otherwise unacceptable response is returned', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityAmendmentUrl()).reply(HttpStatus.CREATED, mockResponses.workPackageCreation);

        nock(GIFT_API_URL).persist().delete(workPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.iAmATeapot);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });
  });
});
