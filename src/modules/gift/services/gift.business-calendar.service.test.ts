import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarService } from './gift.business-calendar.service';

const {
  GIFT: { BUSINESS_CALENDAR, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftBusinessCalendarService', () => {
  const logger = new PinoLogger({});

  let service: GiftBusinessCalendarService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrang

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

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDAR}`,
        payload: BUSINESS_CALENDAR,
      });
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
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftBusinessCalendarService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
          startDate: BUSINESS_CALENDAR.startDate,
          exitDate: BUSINESS_CALENDAR.exitDate,
        });

        // Assert
        const expected = new Error(`Error creating a business calendar for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
