import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarsConventionService } from './gift.business-calendars-convention.service';

const {
  GIFT: { BUSINESS_CALENDARS_CONVENTION, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftBusinessCalendarsConventionService', () => {
  const logger = new PinoLogger({});

  let service: GiftBusinessCalendarsConventionService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockCreateOneResponse = mockResponse201(BUSINESS_CALENDARS_CONVENTION);

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    giftHttpService = {
      get: mockHttpServiceGet,
      post: mockHttpServicePost,
    };

    service = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
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
      });

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDARS_CONVENTION}`,
        payload: {
          businessDayConvention: BUSINESS_CALENDARS_CONVENTION.businessDayConvention,
          dueOnLastWorkingDayEachMonth: BUSINESS_CALENDARS_CONVENTION.dueOnLastWorkingDayEachMonth,
          dateSnapBack: BUSINESS_CALENDARS_CONVENTION.dateSnapBack,
        },
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
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

        service = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne({
          facilityId: mockFacilityId,
          workPackageId: mockWorkPackageId,
        });

        // Assert
        const expected = new Error(`Error creating business calendars convention for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
