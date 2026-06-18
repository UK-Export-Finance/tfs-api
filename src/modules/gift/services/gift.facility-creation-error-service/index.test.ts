import { EXAMPLES } from '@ukef/constants';
import { mockResponse204, mockResponse400, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageService } from '../gift.work-package.service';
import { GiftFacilityCreationErrorService } from '.';

const {
  GIFT: { FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

describe('GiftFacilityCreationErrorService', () => {
  const logger = new PinoLogger({});

  let mockWorkPackageDelete: jest.Mock;

  let workPackageService: GiftWorkPackageService;
  let giftHttpService;

  let service: GiftFacilityCreationErrorService;

  beforeEach(() => {
    // Arrange
    mockWorkPackageDelete = jest.fn().mockResolvedValueOnce(mockResponse204());

    workPackageService = new GiftWorkPackageService(giftHttpService, logger);

    workPackageService.delete = mockWorkPackageDelete;

    service = new GiftFacilityCreationErrorService(workPackageService, logger);
  });

  describe('finallyHandler', () => {
    describe('when a workPackageId is provided', () => {
      it('should call giftWorkPackageService.delete', async () => {
        // Act
        await service.finallyHandler({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        expect(mockWorkPackageDelete).toHaveBeenCalledTimes(1);

        expect(mockWorkPackageDelete).toHaveBeenCalledWith(mockWorkPackageId, mockFacilityId);
      });
    });

    describe('when a workPackageId is NOT provided', () => {
      it('should NOT call giftWorkPackageService.delete', async () => {
        // Act
        const promise = service.finallyHandler({
          facilityId: mockFacilityId,
        });

        await expect(promise).rejects.toThrow();

        // Assert
        expect(mockWorkPackageDelete).not.toHaveBeenCalled();
      });

      it('should throw an error', async () => {
        const expected = {
          message: `Severe error creating a GIFT facility ${mockFacilityId} and deleting work package. No workPackageId available`,
          cause: {
            creationCatchError: false,
            deletionError: expect.any(Error),
          },
        };

        // Act & Assert
        await expect(service.finallyHandler({ facilityId: mockFacilityId })).rejects.toMatchObject(expected);
      });
    });

    describe('when workPackageService.delete throws an error', () => {
      beforeEach(() => {
        // Arrange
        mockWorkPackageDelete = jest.fn().mockRejectedValueOnce(mockResponse400());

        workPackageService.delete = mockWorkPackageDelete;

        service = new GiftFacilityCreationErrorService(workPackageService, logger);
      });

      it('should throw an error', async () => {
        const expected = {
          message: `Severe error creating a GIFT facility ${mockFacilityId} and deleting GIFT facility work package ${mockWorkPackageId}`,
          cause: {
            creationCatchError: false,
            deletionError: mockResponse400(),
          },
        };

        // Act & Assert
        await expect(
          service.finallyHandler({
            facilityId: mockFacilityId,
            workPackageId: mockWorkPackageId,
          }),
        ).rejects.toMatchObject(expected);
      });
    });

    describe('when workPackageService.delete throws an error and creationCatchError param is NOT provided', () => {
      beforeEach(() => {
        // Arrange
        mockWorkPackageDelete = jest.fn().mockRejectedValueOnce(mockResponse500());

        workPackageService.delete = mockWorkPackageDelete;

        service = new GiftFacilityCreationErrorService(workPackageService, logger);
      });

      it('should throw an error', async () => {
        const expected = {
          message: `Severe error creating a GIFT facility ${mockFacilityId} and deleting GIFT facility work package ${mockWorkPackageId}`,
          cause: {
            creationCatchError: false,
            deletionError: mockResponse500(),
          },
        };

        // Act & Assert
        await expect(
          service.finallyHandler({
            facilityId: mockFacilityId,
            workPackageId: mockWorkPackageId,
          }),
        ).rejects.toMatchObject(expected);
      });
    });

    describe('when workPackageService.delete throws an error and creationCatchError param is provided', () => {
      beforeEach(() => {
        // Arrange
        mockWorkPackageDelete = jest.fn().mockRejectedValueOnce(mockResponse500());

        workPackageService.delete = mockWorkPackageDelete;

        service = new GiftFacilityCreationErrorService(workPackageService, logger);
      });

      it('should throw an error', async () => {
        // Arrange
        const mockCreationCatchError = new Error('Mock creation catch error');

        const expected = {
          message: `Severe error creating a GIFT facility ${mockFacilityId} and deleting GIFT facility work package ${mockWorkPackageId}`,
          cause: {
            creationCatchError: mockCreationCatchError,
            deletionError: mockResponse500(),
          },
        };

        // Act & Assert
        await expect(
          service.finallyHandler({
            facilityId: mockFacilityId,
            workPackageId: mockWorkPackageId,
            creationCatchError: mockCreationCatchError,
          }),
        ).rejects.toMatchObject(expected);
      });
    });
  });
});
