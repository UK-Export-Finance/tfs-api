import { HttpStatus } from '@nestjs/common';
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

    describe(`when workPackageService.delete returns a status that is NOT ${HttpStatus.NO_CONTENT}`, () => {
      beforeEach(() => {
        // Arrange
        mockWorkPackageDelete = jest.fn().mockRejectedValueOnce(mockResponse400());

        workPackageService.delete = mockWorkPackageDelete;

        service = new GiftFacilityCreationErrorService(workPackageService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.finallyHandler({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expectedCause = `Creation error: false \n Work package deletion error: ${mockResponse400()}`;

        const expected = new Error(`Severe error creating a GIFT facility ${mockFacilityId} and deleting work package ${mockWorkPackageId}`, {
          cause: expectedCause,
        });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when workPackageService.delete throws an error and creationCatchError param is NOT provided', () => {
      beforeEach(() => {
        // Arrange
        mockWorkPackageDelete = jest.fn().mockRejectedValueOnce(mockResponse500());

        workPackageService.delete = mockWorkPackageDelete;

        service = new GiftFacilityCreationErrorService(workPackageService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.finallyHandler({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expectedCause = `Creation error: false \n Work package deletion error: ${mockResponse500()}`;

        const expected = new Error(`Severe error creating a GIFT facility ${mockFacilityId} and deleting work package ${mockWorkPackageId}`, {
          cause: expectedCause,
        });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when workPackageService.delete throws an error and creationCatchError param is provided', () => {
      beforeEach(() => {
        // Arrange
        mockWorkPackageDelete = jest.fn().mockRejectedValueOnce(mockResponse500());

        workPackageService.delete = mockWorkPackageDelete;

        service = new GiftFacilityCreationErrorService(workPackageService, logger);
      });

      it('should thrown an error', async () => {
        // Arrange
        const mockCreationCatchError = new Error('Mock creation catch error');

        // Act
        const promise = service.finallyHandler({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
          creationCatchError: mockCreationCatchError,
        });

        // Assert
        const expectedCause = `Creation error: ${mockCreationCatchError} \n Work package deletion error: ${mockResponse500()}`;

        const expected = new Error(`Severe error creating a GIFT facility ${mockFacilityId} and deleting work package ${mockWorkPackageId}`, {
          cause: expectedCause,
        });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
