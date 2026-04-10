import { EXAMPLES, GIFT } from '@ukef/constants';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { mockGiftFacilityCreationErrorService } from '@ukef-test/gift/mock-services';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftAccrualScheduleService,
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFacilityCreationErrorService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: { FACILITY_RESPONSE_DATA, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const { PATH } = GIFT;

const mockResponseGet = mockResponse200(FACILITY_RESPONSE_DATA);

describe('GiftFacilityService.get', () => {
  const logger = new PinoLogger({});

  let asyncValidationService: GiftFacilityAsyncValidationService;
  let accrualScheduleService: GiftAccrualScheduleService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let creationErrorService: GiftFacilityCreationErrorService;
  let service: GiftFacilityService;

  let giftHttpService;
  let httpService;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponseGet);

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    httpService = giftHttpService;

    const counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    const currencyService = new GiftCurrencyService(giftHttpService, logger);
    const feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    const mdmService = new MdmService(httpService, logger);
    const productTypeService = new GiftProductTypeService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(
      logger,
      counterpartyService,
      currencyService,
      feeTypeService,
      mdmService,
      productTypeService,
    );

    accrualScheduleService = new GiftAccrualScheduleService(giftHttpService, logger);
    businessCalendarService = new GiftBusinessCalendarService(giftHttpService, logger);
    businessCalendarsConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);
    creationErrorService = mockGiftFacilityCreationErrorService();

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      accrualScheduleService,
      businessCalendarService,
      businessCalendarsConventionService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      riskDetailsService,
      statusService,
      creationErrorService,
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call giftHttpService.get', async () => {
    // Act
    await service.get(mockFacilityId);

    // Assert
    expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

    expect(mockHttpServiceGet).toHaveBeenCalledWith({
      path: `${PATH.FACILITY}/${mockFacilityId}`,
    });
  });

  describe('when giftHttpService.get is successful', () => {
    it('should return the response of giftHttpService.get', async () => {
      // Act
      const response = await service.get(mockFacilityId);

      // Assert
      expect(response).toEqual(mockResponseGet);
    });
  });

  describe('when giftHttpService.get returns an error', () => {
    const mockError = mockResponse500();

    beforeEach(() => {
      // Arrange
      mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockError);

      giftHttpService.get = mockHttpServiceGet;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
      );
    });

    it('should throw an error', async () => {
      // Act
      const promise = service.get(mockFacilityId);

      // Assert
      const expected = new Error(`Error getting a GIFT facility ${mockFacilityId}`, { cause: mockError });

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
