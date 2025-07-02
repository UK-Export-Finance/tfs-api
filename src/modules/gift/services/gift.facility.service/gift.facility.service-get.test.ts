import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
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

  let httpService: HttpService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponseGet);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    const currencyService = new GiftCurrencyService(giftHttpService, logger);
    const productTypeService = new GiftProductTypeService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(logger, currencyService, productTypeService);
    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      statusService,
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
    beforeEach(() => {
      // Arrange
      mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

      httpService.get = mockHttpServiceGet;

      giftHttpService.get = mockHttpServiceGet;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );
    });

    it('should thrown an error', async () => {
      // Act
      const promise = service.get(mockFacilityId);

      // Assert
      const expected = new Error(`Error getting a GIFT facility ${mockFacilityId}`);

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
