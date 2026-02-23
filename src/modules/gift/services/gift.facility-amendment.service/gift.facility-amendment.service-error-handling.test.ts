import { HttpStatus } from '@nestjs/common';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse204, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from '../gift.work-package.service';
import { GiftFacilityAmendmentService } from '.';

const { PATH } = GIFT;

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA, FACILITY_ID: mockFacilityId, FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload },
} = EXAMPLES;

const mockWorkPackageServiceCreateResponse = mockResponse201(WORK_PACKAGE_CREATION_RESPONSE_DATA);

describe('GiftFacilityAmendmentService - error handling', () => {
  const logger = new PinoLogger({});

  let mockHttpServicePost: jest.Mock;
  let mockHttpServiceDelete: jest.Mock;
  let workPackageService: GiftWorkPackageService;
  let mockWorkPackageServiceCreate: jest.Mock;

  let service: GiftFacilityAmendmentService;

  let giftHttpService;

  beforeEach(() => {
    // Arrange
    workPackageService = new GiftWorkPackageService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('giftWorkPackageService.create', () => {
    beforeEach(() => {
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
      describe.each([
        HttpStatus.ACCEPTED,
        HttpStatus.BAD_GATEWAY,
        HttpStatus.BAD_REQUEST,
        HttpStatus.CONFLICT,
        HttpStatus.FORBIDDEN,
        HttpStatus.I_AM_A_TEAPOT,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.NOT_FOUND,
        HttpStatus.OK,
      ])('with status %s', (status) => {
        const mockResponseData = WORK_PACKAGE_CREATION_RESPONSE_DATA;

        beforeEach(() => {
          // Arrange
          mockHttpServicePost = jest.fn().mockResolvedValueOnce({
            status,
            data: mockResponseData,
          });

          mockHttpServiceDelete = jest.fn().mockResolvedValueOnce(mockResponse204());

          giftHttpService = {
            delete: mockHttpServiceDelete,
            post: mockHttpServicePost,
          };

          service = new GiftFacilityAmendmentService(giftHttpService, logger, workPackageService);
        });

        it(`should return a response with the received status and data - %s`, async () => {
          // Act
          const response = await service.create(mockFacilityId, mockPayload);

          // Assert
          const expected = {
            status,
            data: mockResponseData,
          };

          expect(response).toEqual(expected);
        });

        it('should call giftHttpService.delete', async () => {
          // Act
          await service.create(mockFacilityId, mockPayload);

          // Assert
          expect(mockHttpServiceDelete).toHaveBeenCalledTimes(1);
          expect(mockHttpServiceDelete).toHaveBeenCalledWith({
            path: `${PATH.WORK_PACKAGE}/${WORK_PACKAGE_CREATION_RESPONSE_DATA.id}`,
          });
        });

        describe('when giftHttpService.delete throws an error', () => {
          it('should throw an error', async () => {
            // Arrange
            const mockError = mockResponse500();

            mockHttpServicePost = jest.fn().mockResolvedValueOnce({
              status,
              data: mockResponseData,
            });

            mockHttpServiceDelete = jest.fn().mockRejectedValueOnce(mockError);

            giftHttpService = {
              delete: mockHttpServiceDelete,
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

    describe('when giftHttpService.post throws an error', () => {
      it('should throw an error', async () => {
        // Arrange
        const mockError = mockResponse500();

        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

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
