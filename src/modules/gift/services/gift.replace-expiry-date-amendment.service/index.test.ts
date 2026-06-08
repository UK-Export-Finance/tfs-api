import { AMEND_FACILITY_PREFIX_TYPES, EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
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
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  PATH,
} = GIFT;

describe('GiftReplaceExpiryDateAmendmentService', () => {
  const logger = new PinoLogger({});

  let service: GiftReplaceExpiryDateAmendmentService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpServicePost = jest.fn().mockResolvedValue(mockResponse201({ id: 'mock-amendment-response' }));

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('facility', () => {
    it('should call giftHttpService.post', async () => {
      // Act
      await service.facility({
        amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
        expiryDate: REPLACE_EXPIRY_DATE.expiryDate,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/AmendFacility_${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`,
        payload: {
          expiryDate: REPLACE_EXPIRY_DATE.expiryDate,
        },
      });
    });

    it('should return the response from giftHttpService.post', async () => {
      // Arrange
      const mockResponse = mockResponse201({ facility: true });

      mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponse);
      giftHttpService.post = mockHttpServicePost;

      service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);

      // Act
      const response = await service.facility({
        amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
        expiryDate: REPLACE_EXPIRY_DATE.expiryDate,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(response).toEqual(mockResponse);
    });
  });

  describe('obligations', () => {
    const mockObligations = [{ id: '1' }, { id: '2' }, { id: '3' }];

    it('should call giftHttpService.post for each obligation', async () => {
      // Arrange
      mockHttpServicePost = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201({ one: true }))
        .mockResolvedValueOnce(mockResponse201({ two: true }))
        .mockResolvedValueOnce(mockResponse201({ three: true }));

      giftHttpService.post = mockHttpServicePost;

      service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);

      // Act
      await service.obligations({
        amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
        facilityExpiryDate: REPLACE_EXPIRY_DATE.expiryDate,
        facilityId: mockFacilityId,
        obligations: mockObligations,
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(3);

      const expectedPath = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${AMEND_FACILITY_PREFIX_TYPES.AMEND_OBLIGATION}ReplaceMaturityDate`;

      expect(mockHttpServicePost).toHaveBeenNthCalledWith(1, {
        path: expectedPath,
        payload: {
          obligationId: '1',
          maturityDate: REPLACE_EXPIRY_DATE.expiryDate,
        },
      });

      expect(mockHttpServicePost).toHaveBeenNthCalledWith(2, {
        path: expectedPath,
        payload: {
          obligationId: '2',
          maturityDate: REPLACE_EXPIRY_DATE.expiryDate,
        },
      });

      expect(mockHttpServicePost).toHaveBeenNthCalledWith(3, {
        path: expectedPath,
        payload: {
          obligationId: '3',
          maturityDate: REPLACE_EXPIRY_DATE.expiryDate,
        },
      });
    });

    it('should return all obligation amendment response data', async () => {
      // Arrange
      const responseOne = mockResponse201({ one: true });
      const responseTwo = mockResponse201({ two: true });

      mockHttpServicePost = jest.fn().mockResolvedValueOnce(responseOne).mockResolvedValueOnce(responseTwo);
      giftHttpService.post = mockHttpServicePost;

      service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);

      // Act
      const response = await service.obligations({
        amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
        facilityExpiryDate: REPLACE_EXPIRY_DATE.expiryDate,
        facilityId: mockFacilityId,
        obligations: [{ id: '1' }, { id: '2' }],
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(response).toEqual([responseOne.data, responseTwo.data]);
    });

    describe('when giftHttpService.post throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);
        giftHttpService.post = mockHttpServicePost;

        service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);

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

      it('should stop processing obligations and throw when a later post call fails', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest
          .fn()
          .mockResolvedValueOnce(mockResponse201({ one: true }))
          .mockRejectedValueOnce(mockError);
        giftHttpService.post = mockHttpServicePost;

        service = new GiftReplaceExpiryDateAmendmentService(giftHttpService, logger);

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
