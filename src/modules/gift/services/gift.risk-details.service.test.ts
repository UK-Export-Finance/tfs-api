import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftRiskDetailsService } from './gift.risk-details.service';

const {
  GIFT: { FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId, RISK_DETAILS },
} = EXAMPLES;

const { EVENT_TYPES, INTEGRATION_DEFAULTS, PATH } = GIFT;

describe('GiftRiskDetailsService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftRiskDetailsService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(RISK_DETAILS);

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.get = mockHttpServiceGet;
    httpService.post = mockHttpServicePost;

    giftHttpService = {
      get: mockHttpServiceGet,
      post: mockHttpServicePost,
    };

    service = new GiftRiskDetailsService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(RISK_DETAILS, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_RISK_DETAILS}`,
        payload: {
          ...RISK_DETAILS,
          overrideRiskRating: INTEGRATION_DEFAULTS.OVERRIDE_RISK_RATING,
          overrideLossGivenDefault: INTEGRATION_DEFAULTS.OVERRIDE_LOSS_GIVEN_DEFAULT,
          riskReassessmentDate: INTEGRATION_DEFAULTS.RISK_REASSESSMENT_DATE,
        },
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(RISK_DETAILS, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftRiskDetailsService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(RISK_DETAILS, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating risk details for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
