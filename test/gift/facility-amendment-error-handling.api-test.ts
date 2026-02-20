import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { apimFacilityAmendmentUrl, facilityAmendmentUrl, facilityWorkPackageUrl, mockResponses, workPackageUrl } from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_INCREASE_AMOUNT },
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
    nock(GIFT_API_URL).persist().post(facilityAmendmentUrl(AMEND_FACILITY_INCREASE_AMOUNT)).reply(HttpStatus.CREATED, mockResponses.facilityAmendment);
  });

  describe('GIFT "create work package - congifuration event" endpoint', () => {
    describe(`when a ${HttpStatus.BAD_REQUEST} response is returned`, () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

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
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

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
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

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
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an unacceptable response is returned', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(facilityWorkPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.iAmATeapot);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

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
        nock(GIFT_API_URL).persist().post(workPackageUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(workPackageUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.FORBIDDEN} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(workPackageUrl).reply(HttpStatus.FORBIDDEN, mockResponses.forbidden);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} response is returned`, () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(workPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.internalServerError);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an unacceptable response is returned', () => {
      it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
        // Arrange
        nock(GIFT_API_URL).persist().post(workPackageUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.iAmATeapot);

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD);

        // Assert
        expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        const expected = mockResponses.internalServerError;

        expect(body).toStrictEqual(expected);
      });
    });
  });
});
