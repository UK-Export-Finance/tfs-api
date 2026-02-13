import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from '../gift.work-package.service';
import { GiftFacilityAmendmentService } from '.';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA, FACILITY_ID: mockFacilityId, FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload },
} = EXAMPLES;

const mockWorkPackageServiceCreateResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);

describe('GiftFacilityAmendmentService - error handling', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let mockHttpServicePost: jest.Mock;
  let workPackageService: GiftWorkPackageService;
  let mockWorkPackageServiceCreate: jest.Mock;

  let service: GiftFacilityAmendmentService;

  let giftHttpService;

  beforeEach(() => {
    // Arrange
    workPackageService = new GiftWorkPackageService(giftHttpService, logger);
    httpService = new HttpService();

    // mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockWorkPackageServiceCreateResponse);
    // mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);

    // workPackageService.create = mockWorkPackageServiceCreate;

    // httpService.post = mockHttpServicePost;

    // giftHttpService = {
    //   post: mockHttpServicePost,
    // };

    // service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('giftWorkPackageService.create', () => {
    beforeEach(() => {
      // httpService.post = mockHttpServicePost;

      giftHttpService = {
        post: mockHttpServicePost,
      };
    });

    describe(`when giftWorkPackageService.create does NOT return a ${HttpStatus.CREATED} status`, () => {
      it.each([
        HttpStatus.ACCEPTED,
        HttpStatus.BAD_GATEWAY,
        HttpStatus.BAD_REQUEST,
        HttpStatus.CONFLICT,
        HttpStatus.FORBIDDEN,
        HttpStatus.I_AM_A_TEAPOT,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        HttpStatus.OK,
      ])('should return a response with the received status and data', async (status) => {
        // Arrange
        const mockResponseData = WORK_PACKAGE_CREATION_RESPONSE_DATA;

        mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce({
          status,
          data: mockResponseData,
        });

        workPackageService.create = mockWorkPackageServiceCreate;

        service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = {
          status,
          data: mockResponseData,
        };

        expect(response).toEqual(expected);
      });
    });

    describe('when giftWorkPackageService.create throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockWorkPackageServiceCreate = jest.fn().mockRejectedValueOnce(mockError);

        workPackageService.create = mockWorkPackageServiceCreate;

        service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = new Error(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });
  });

  describe('giftHttpService.post', () => {
    beforeEach(() => {
      mockWorkPackageServiceCreate = jest.fn().mockResolvedValueOnce(mockWorkPackageServiceCreateResponse);

      workPackageService.create = mockWorkPackageServiceCreate;
    });

    describe(`when giftHttpService.post does NOT return a ${HttpStatus.CREATED} status`, () => {
      it.each([
        HttpStatus.ACCEPTED,
        HttpStatus.BAD_GATEWAY,
        HttpStatus.BAD_REQUEST,
        HttpStatus.CONFLICT,
        HttpStatus.FORBIDDEN,
        HttpStatus.I_AM_A_TEAPOT,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        HttpStatus.OK,
      ])('should return a response with the received status and data', async (status) => {
        // Arrange
        const mockResponseData = WORK_PACKAGE_CREATION_RESPONSE_DATA;

        mockHttpServicePost = jest.fn().mockResolvedValueOnce({
          status,
          data: mockResponseData,
        });

        // httpService.post = mockHttpServicePost;

        giftHttpService = {
          post: mockHttpServicePost,
        };

        service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);

        // Act
        const response = await service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = {
          status,
          data: mockResponseData,
        };

        expect(response).toEqual(expected);
      });
    });

    describe('when giftHttpService.post throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

        httpService.post = mockHttpServicePost;

        giftHttpService = {
          post: mockHttpServicePost,
        };

        service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);

        // Act
        const response = service.create(mockFacilityId, mockPayload);

        // Assert
        const expected = new Error(`Error creating amendment ${mockPayload.amendmentType} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(response).rejects.toThrow(expected);
      });
    });
  });
});
