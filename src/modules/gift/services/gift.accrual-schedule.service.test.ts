import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse400, mockResponse418, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftAccrualScheduleService } from './gift.accrual-schedule.service';

const {
  GIFT: { ACCRUAL_SCHEDULE, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, INTEGRATION_DEFAULTS, PATH } = GIFT;

describe('GiftAccrualScheduleService', () => {
  const logger = new PinoLogger({});

  let service: GiftAccrualScheduleService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftAccrualScheduleService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockAccrualSchedule = ACCRUAL_SCHEDULE;

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockAccrualSchedule, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      const expected = {
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_ACCRUAL_SCHEDULE_FIXED_RATE}`,
        payload: {
          ...mockAccrualSchedule,
          dateSnapBackOverride: INTEGRATION_DEFAULTS.DATE_SNAP_BACK_OVERRIDE,
          baseRateTypeCode: null,
          additionalRateTypeCode: null,
          acbsInterestScheduleId: INTEGRATION_DEFAULTS.ACBS_INTEREST_SCHEDULE_ID,
        },
      };

      expect(mockHttpServicePost).toHaveBeenCalledWith(expected);
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockAccrualSchedule, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftAccrualScheduleService(giftHttpService, logger);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.createOne(mockAccrualSchedule, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(
          `Error creating an accrual schedule with schedule type code ${mockAccrualSchedule.accrualScheduleTypeCode} for facility ${mockFacilityId}`,
        );

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const accrualSchedulesLength = 3;

    const mockAccrualSchedules = Array(accrualSchedulesLength).fill(ACCRUAL_SCHEDULE);

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockAccrualSchedules));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockAccrualSchedules);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockAccrualSchedules[0]))
        .mockResolvedValueOnce(mockResponse201(mockAccrualSchedules[1]))
        .mockResolvedValueOnce(mockResponse201(mockAccrualSchedules[2]));

      service = new GiftAccrualScheduleService(giftHttpService, logger);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided accrual schedule', async () => {
      // Act
      await service.createMany(mockAccrualSchedules, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(accrualSchedulesLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockAccrualSchedules[0], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockAccrualSchedules[1], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockAccrualSchedules[2], mockFacilityId, mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        // Act
        const response = await service.createMany(mockAccrualSchedules, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockError);

        service = new GiftAccrualScheduleService(giftHttpService, logger);

        service.createOne = mockCreateOne;
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.createMany(mockAccrualSchedules, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating accrual schedules for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when service.createOne returns multiple unacceptable and acceptable error statuses', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOneResponse = mockResponse201(mockAccrualSchedules);

        service = new GiftAccrualScheduleService(giftHttpService, logger);

        mockCreateOne = jest.fn().mockResolvedValueOnce(mockResponse418()).mockResolvedValueOnce(mockResponse500()).mockResolvedValueOnce(mockResponse400());

        service.createOne = mockCreateOne;
      });

      it('should continue to call service.createOne with mapped data for each provided accrual schedule', async () => {
        // Act
        await service.createMany(mockAccrualSchedules, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(mockCreateOne).toHaveBeenCalledTimes(accrualSchedulesLength);

        expect(mockCreateOne).toHaveBeenCalledWith(mockAccrualSchedules[0], mockFacilityId, mockWorkPackageId);
        expect(mockCreateOne).toHaveBeenCalledWith(mockAccrualSchedules[1], mockFacilityId, mockWorkPackageId);
        expect(mockCreateOne).toHaveBeenCalledWith(mockAccrualSchedules[2], mockFacilityId, mockWorkPackageId);
      });
    });
  });
});
