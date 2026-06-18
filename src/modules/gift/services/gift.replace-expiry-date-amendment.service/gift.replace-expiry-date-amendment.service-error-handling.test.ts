import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftReplaceExpiryDateAmendmentService } from '.';

const {
  GIFT: {
    FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA: { REPLACE_EXPIRY_DATE },
    FACILITY_ID: mockFacilityId,
    WORK_PACKAGE_ID: mockWorkPackageId,
  },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

describe('GiftReplaceExpiryDateAmendmentService - error handling', () => {
  const logger = new PinoLogger({});

  let service: GiftReplaceExpiryDateAmendmentService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;

  const buildService = () => {
    service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);
  };

  beforeEach(() => {
    giftHttpService = {};

    mockHttpServicePost = jest.fn();

    giftHttpService.post = mockHttpServicePost;

    buildService();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('facility', () => {
    describe('when giftHttpService.post throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);
        giftHttpService.post = mockHttpServicePost;

        buildService();

        // Act
        const response = service.facility({
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          expiryDate: REPLACE_EXPIRY_DATE.expiryDate,
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expected = new Error(
          `Error amending facility expiry date ${AMEND_FACILITY_REPLACE_EXPIRY_DATE} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
          { cause: mockError },
        );

        await expect(response).rejects.toThrow(expected);
      });
    });

    describe('when giftHttpService.post throws an Error instance', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = new Error('network unavailable');

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);
        giftHttpService.post = mockHttpServicePost;

        buildService();

        // Act
        const response = service.facility({
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          expiryDate: REPLACE_EXPIRY_DATE.expiryDate,
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        await expect(response).rejects.toThrow(
          `Error amending facility expiry date ${AMEND_FACILITY_REPLACE_EXPIRY_DATE} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
        );
      });
    });
  });

  describe('obligations', () => {
    describe('when giftHttpService.post throws on first obligation', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);
        giftHttpService.post = mockHttpServicePost;

        buildService();

        // Act
        const response = service.obligations({
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          facilityExpiryDate: REPLACE_EXPIRY_DATE.expiryDate,
          facilityId: mockFacilityId,
          obligations: [{ id: '1' }],
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expected = new Error(
          `Error amending facility obligations maturity dates ${AMEND_FACILITY_REPLACE_EXPIRY_DATE} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
          { cause: mockError },
        );

        await expect(response).rejects.toThrow(expected);
      });
    });

    describe('when giftHttpService.post throws on a later obligation', () => {
      it('should stop processing and throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest
          .fn()
          .mockResolvedValueOnce({ data: { one: true } })
          .mockRejectedValueOnce(mockError);

        giftHttpService.post = mockHttpServicePost;

        buildService();

        // Act
        const response = service.obligations({
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          facilityExpiryDate: REPLACE_EXPIRY_DATE.expiryDate,
          facilityId: mockFacilityId,
          obligations: [{ id: '1' }, { id: '2' }, { id: '3' }],
          workPackageId: mockWorkPackageId,
        });

        // Assert
        await expect(response).rejects.toThrow(
          `Error amending facility obligations maturity dates ${AMEND_FACILITY_REPLACE_EXPIRY_DATE} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
        );

        expect(mockHttpServicePost).toHaveBeenCalledTimes(2);
      });
    });
  });
});
