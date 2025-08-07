import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarService } from './gift.business-calendar.service';

const {
  GIFT: { BUSINESS_CALENDAR, COUNTERPARTY, COUNTERPARTY_ROLE, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftBusinessCalendarService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftBusinessCalendarService;

  let giftHttpService;
  let mockGetResponse;
  let mockCreateOneResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockGetResponse = mockResponse200([COUNTERPARTY_ROLE, COUNTERPARTY_ROLE]);
    mockCreateOneResponse = mockResponse201(COUNTERPARTY());

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.get = mockHttpServiceGet;
    httpService.post = mockHttpServicePost;

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
    const mockCounterparty = COUNTERPARTY();

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
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`,
        payload: mockCounterparty,
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
        const expected = new Error(`Error creating a business calendar with for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
