import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftObligationSubtypeService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD: mockPayload, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const { PATH } = GIFT;

const mockHttpPostResponse = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftFacilityService.createInitialFacility', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockHttpPostResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    const counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    const currencyService = new GiftCurrencyService(giftHttpService, logger);
    const feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    const obligationSubtypeService = new GiftObligationSubtypeService(giftHttpService, logger);
    const productTypeService = new GiftProductTypeService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(
      logger,
      counterpartyService,
      currencyService,
      feeTypeService,
      obligationSubtypeService,
      productTypeService,
    );

    businessCalendarService = new GiftBusinessCalendarService(giftHttpService, logger);
    businessCalendarsConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      businessCalendarService,
      businessCalendarsConventionService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      riskDetailsService,
      statusService,
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call giftHttpService.post', async () => {
    // Act
    await service.createInitialFacility(mockPayload.overview);

    // Assert
    expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

    expect(mockHttpServicePost).toHaveBeenCalledWith({
      path: PATH.CREATE_FACILITY,
      payload: mockPayload.overview,
    });
  });

  describe('when giftHttpService.post is successful', () => {
    it('should return the response of giftHttpService.post', async () => {
      // Act
      const response = await service.createInitialFacility(mockPayload.overview);

      // Assert
      expect(response).toEqual(mockHttpPostResponse);
    });
  });

  describe('when giftHttpService.post returns an error', () => {
    beforeEach(() => {
      // Arrange
      mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

      httpService.post = mockHttpServicePost;

      giftHttpService.post = mockHttpServicePost;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
      );
    });

    it('should thrown an error', async () => {
      // Act
      const promise = service.createInitialFacility(mockPayload.overview);

      // Assert
      const expected = new Error(`Error creating an initial GIFT facility ${mockFacilityId}`);

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
