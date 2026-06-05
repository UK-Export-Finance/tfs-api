import { HttpStatus } from '@nestjs/common';
import { AMEND_FACILITY_PREFIX_TYPES, EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse204, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftAmountAmendmentService } from '.';

const {
  GIFT: { FACILITY_AMENDMENT_REQUEST_PAYLOAD, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_INCREASE_AMOUNT },
  FACILITY_CATEGORY_CODES,
  PATH,
} = GIFT;

describe('GiftAmountAmendmentService', () => {
  const logger = new PinoLogger({});
  const mockFacilityCategoryCode = FACILITY_CATEGORY_CODES.CONTINGENT;

  let service: GiftAmountAmendmentService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let mockHttpServiceDelete: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpServicePost = jest.fn().mockResolvedValue(mockResponse201({ id: 'mock-amendment-response' }));
    mockHttpServiceDelete = jest.fn().mockResolvedValue(mockResponse204());

    giftHttpService = {
      post: mockHttpServicePost,
      delete: mockHttpServiceDelete,
    };

    service = new GiftAmountAmendmentService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('facility', () => {
    it('should call giftHttpService.post', async () => {
      // Arrange
      const amendmentType = AMEND_FACILITY_INCREASE_AMOUNT;
      const { amendmentData } = FACILITY_AMENDMENT_REQUEST_PAYLOAD;

      // Act
      await service.facility({
        amendmentType,
        amendmentData,
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      const expected = {
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/AmendFacility_${amendmentType}`,
        payload: amendmentData,
      };

      expect(mockHttpServicePost).toHaveBeenCalledWith(expected);
    });

    describe(`when giftHttpService.post returns a ${HttpStatus.CREATED} status`, () => {
      it('should return the response from giftHttpService.post', async () => {
        // Arrange
        const mockPostResponse = mockResponse201({ id: 'mock-amendment-response' });

        mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockPostResponse);

        giftHttpService.post = mockHttpServicePost;

        service = new GiftAmountAmendmentService(giftHttpService, logger);

        // Act
        const response = await service.facility({
          amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
          amendmentData: FACILITY_AMENDMENT_REQUEST_PAYLOAD.amendmentData,
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        expect(response).toEqual(mockPostResponse);
      });
    });

    describe(`when giftHttpService.post does NOT return a ${HttpStatus.CREATED} status`, () => {
      const mockPostResponse = {
        status: HttpStatus.BAD_REQUEST,
        data: { badRequest: true },
      };
      const mockDeleteResponse = mockResponse204();

      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockPostResponse);
        mockHttpServiceDelete = jest.fn().mockResolvedValueOnce(mockDeleteResponse);

        giftHttpService.post = mockHttpServicePost;
        giftHttpService.delete = mockHttpServiceDelete;

        service = new GiftAmountAmendmentService(giftHttpService, logger);
      });

      describe('delete behaviour', () => {
        it('should call giftHttpService.delete', async () => {
          // Act
          await service.facility({
            amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
            amendmentData: FACILITY_AMENDMENT_REQUEST_PAYLOAD.amendmentData,
            facilityId: mockFacilityId,
            workPackageId: mockWorkPackageId,
          });

          // Assert
          expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);
          expect(mockHttpServiceDelete).toHaveBeenCalledWith({
            path: `${PATH.WORK_PACKAGE}/${mockWorkPackageId}`,
          });
        });
      });

      describe('response', () => {
        it('should return the response from giftHttpService.delete', async () => {
          // Act
          const response = await service.facility({
            amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
            amendmentData: FACILITY_AMENDMENT_REQUEST_PAYLOAD.amendmentData,
            facilityId: mockFacilityId,
            workPackageId: mockWorkPackageId,
          });

          // Assert
          expect(response).toEqual(mockPostResponse);
        });
      });
    });

    describe('when giftHttpService.post throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.post = mockHttpServicePost;

        service = new GiftAmountAmendmentService(giftHttpService, logger);

        // Act
        const promise = service.facility({
          amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
          amendmentData: FACILITY_AMENDMENT_REQUEST_PAYLOAD.amendmentData,
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expected = new Error(
          `Error amending facility amount ${AMEND_FACILITY_INCREASE_AMOUNT} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
          { cause: mockError },
        );

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('obligations', () => {
    const mockObligations = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const mockDate = FACILITY_AMENDMENT_REQUEST_PAYLOAD.amendmentData.date;
    const mockNewFacilityAmount = FACILITY_AMENDMENT_REQUEST_PAYLOAD.amendmentData.amount;

    it('should call giftHttpService.post for each obligation', async () => {
      // Arrange
      mockHttpServicePost = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201({ one: true }))
        .mockResolvedValueOnce(mockResponse201({ two: true }))
        .mockResolvedValueOnce(mockResponse201({ three: true }));

      giftHttpService.post = mockHttpServicePost;

      service = new GiftAmountAmendmentService(giftHttpService, logger);

      // Act
      await service.obligations({
        amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
        date: mockDate,
        facilityId: mockFacilityId,
        facilityCategoryCode: mockFacilityCategoryCode,
        newFacilityAmount: mockNewFacilityAmount,
        obligations: mockObligations,
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(3);

      const expectedAmount = 128;
      const expectedPath = `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${AMEND_FACILITY_PREFIX_TYPES.AMEND_OBLIGATION}${AMEND_FACILITY_INCREASE_AMOUNT}`;

      expect(mockHttpServicePost).toHaveBeenNthCalledWith(1, {
        path: expectedPath,
        payload: {
          obligationId: '1',
          date: mockDate,
          amount: expectedAmount,
        },
      });

      expect(mockHttpServicePost).toHaveBeenNthCalledWith(2, {
        path: expectedPath,
        payload: {
          obligationId: '2',
          date: mockDate,
          amount: expectedAmount,
        },
      });

      expect(mockHttpServicePost).toHaveBeenNthCalledWith(3, {
        path: expectedPath,
        payload: {
          obligationId: '3',
          date: mockDate,
          amount: expectedAmount,
        },
      });
    });

    it('should return all obligation amendment responses', async () => {
      // Arrange
      const responseOne = mockResponse201({ one: true });
      const responseTwo = mockResponse201({ two: true });

      mockHttpServicePost = jest.fn().mockResolvedValueOnce(responseOne).mockResolvedValueOnce(responseTwo);

      giftHttpService.post = mockHttpServicePost;

      service = new GiftAmountAmendmentService(giftHttpService, logger);

      // Act
      const response = await service.obligations({
        amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
        date: mockDate,
        facilityId: mockFacilityId,
        facilityCategoryCode: mockFacilityCategoryCode,
        newFacilityAmount: mockNewFacilityAmount,
        obligations: [{ id: '1' }, { id: '2' }],
        workPackageId: mockWorkPackageId,
      });

      // Assert
      expect(response).toEqual([responseOne, responseTwo]);
    });

    it('should throw an error when the facility amount is not an integer', async () => {
      // Act
      const promise = service.obligations({
        amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
        date: mockDate,
        facilityId: mockFacilityId,
        facilityCategoryCode: mockFacilityCategoryCode,
        newFacilityAmount: 100.5,
        obligations: [{ id: '1' }],
        workPackageId: mockWorkPackageId,
      });

      // Assert
      const expected = new Error(
        `Error amending facility obligation amounts ${AMEND_FACILITY_INCREASE_AMOUNT} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
        {
          cause: new Error('calculatePercentageAmount - amount must be a safe integer. Received: 100.5'),
        },
      );

      await expect(promise).rejects.toThrow(expected);
    });

    describe('when giftHttpService.post throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.post = mockHttpServicePost;

        service = new GiftAmountAmendmentService(giftHttpService, logger);

        // Act
        const promise = service.obligations({
          amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
          date: mockDate,
          facilityId: mockFacilityId,
          facilityCategoryCode: mockFacilityCategoryCode,
          newFacilityAmount: mockNewFacilityAmount,
          obligations: [{ id: '1' }],
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expected = new Error(
          `Error amending facility obligation amounts ${AMEND_FACILITY_INCREASE_AMOUNT} for facility ${mockFacilityId} work package ${mockWorkPackageId}`,
          { cause: mockError },
        );

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
