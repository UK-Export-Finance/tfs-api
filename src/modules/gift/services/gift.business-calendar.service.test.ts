import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarService } from './gift.business-calendar.service';

const {
  GIFT: { BUSINESS_CALENDAR, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, INTEGRATION_DEFAULTS, PATH } = GIFT;

describe('GiftBusinessCalendarService', () => {
  const logger = new PinoLogger({});

  let service: GiftBusinessCalendarService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange

    mockCreateOneResponse = mockResponse201(BUSINESS_CALENDAR);

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    giftHttpService = {
      get: mockHttpServiceGet,
      post: mockHttpServicePost,
    };

    service = new GiftBusinessCalendarService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    describe('when optional date fields are provided', () => {
      it('should call giftHttpService.post with the provided date fields', async () => {
        // Arrange
        const payload = {
          ...BUSINESS_CALENDAR,
          startDate: '2024-01-01',
          exitDate: '2024-02-01',
        };

        // Act
        await service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
          startDate: payload.startDate,
          exitDate: payload.exitDate,
        });

        // Assert
        expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

        const expected = {
          path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDAR}`,
          payload,
        };

        expect(mockHttpServicePost).toHaveBeenCalledWith(expected);
      });
    });

    describe('when optional date fields are NOT provided', () => {
      it('should call giftHttpService.post with default date field values', async () => {
        // Arrange
        const payload = {
          ...BUSINESS_CALENDAR,
          startDate: undefined,
          exitDate: undefined,
        };

        // Act
        await service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
          startDate: payload.startDate,
          exitDate: payload.exitDate,
        });

        // Assert
        expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

        const expected = {
          path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDAR}`,
          payload: {
            ...payload,
            exitDate: INTEGRATION_DEFAULTS.BUSINESS_CALENDAR_EXIT_DATE,
            startDate: INTEGRATION_DEFAULTS.BUSINESS_CALENDAR_START_DATE,
          },
        };

        expect(mockHttpServicePost).toHaveBeenCalledWith(expected);
      });
    });

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne({
        facilityId: mockFacilityId,
        workPackageId: mockWorkPackageId,
        startDate: BUSINESS_CALENDAR.startDate,
        exitDate: BUSINESS_CALENDAR.exitDate,
      });

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      const expected = {
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDAR}`,
        payload: BUSINESS_CALENDAR,
      };

      expect(mockHttpServicePost).toHaveBeenCalledWith(expected);
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
          startDate: BUSINESS_CALENDAR.startDate,
          exitDate: BUSINESS_CALENDAR.exitDate,
        });

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.post = mockHttpServicePost;

        service = new GiftBusinessCalendarService(giftHttpService, logger);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
          startDate: BUSINESS_CALENDAR.startDate,
          exitDate: BUSINESS_CALENDAR.exitDate,
        });

        // Assert
        const expected = new Error(`Error creating a business calendar for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
