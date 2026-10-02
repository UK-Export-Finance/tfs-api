import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { mockResponse200 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftAccrualScheduleService,
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFacilityCreationErrorService,
  GiftFacilityService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftHttpService,
  GiftObligationService,
  GiftProductTypeService,
  GiftQueueService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
  GiftWorkPackageService,
} from '../services';
import { GiftFacilitiesController } from './gift.facilities.controller';

const mockResponseGetMany = [
  mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA).data,
  mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA).data,
  mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA).data,
];

describe('GiftFacilitiesController', () => {
  const logger = new PinoLogger({});

  let giftHttpService: GiftHttpService;
  let httpService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let accrualScheduleService: GiftAccrualScheduleService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let giftFacilityService: GiftFacilityService;
  let giftWorkPackageService: GiftWorkPackageService;
  let creationErrorService: GiftFacilityCreationErrorService;
  let giftQueueService: GiftQueueService;
  let controller: GiftFacilitiesController;

  let mockServiceGetMany;

  let mockRes;
  let mockResStatus;

  beforeEach(() => {
    // Arrange
    giftHttpService = {} as GiftHttpService;

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
    giftWorkPackageService = new GiftWorkPackageService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);
    creationErrorService = new GiftFacilityCreationErrorService(giftWorkPackageService, logger);

    giftFacilityService = new GiftFacilityService(
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

    mockServiceGetMany = jest.fn().mockResolvedValueOnce(mockResponseGetMany);

    giftFacilityService.getMany = mockServiceGetMany;

    mockResStatus = jest.fn();
    mockRes = { status: mockResStatus };

    giftQueueService = { enqueue: jest.fn() } as unknown as GiftQueueService;
    controller = new GiftFacilitiesController(giftFacilityService, giftQueueService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET ?ids=:ids', () => {
    // Arrange
    const mockIds = EXAMPLES.GIFT.FACILITY_IDS_QUERY_PARAM.split(',') as UkefId[];

    const mockParams = {
      ids: mockIds,
    };

    it('should call giftQueueService.enqueue with the facility get many message and message type', async () => {
      // Act
      await controller.getManyQueue(mockParams, mockRes);

      // Assert
      expect(giftQueueService.enqueue).toHaveBeenCalledTimes(1);
      expect(giftQueueService.enqueue).toHaveBeenCalledWith({ messageType: 'FACILITY_GET_MANY', ids: mockIds });
    });

    it('should call res.status with HttpStatus.ACCEPTED', async () => {
      // Act
      await controller.getManyQueue(mockParams, mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);
      expect(mockResStatus).toHaveBeenCalledWith(HttpStatus.ACCEPTED);
    });
  });

  describe('GET without-queue?ids=:ids', () => {
    // Arrange
    const mockIds = EXAMPLES.GIFT.FACILITY_IDS_QUERY_PARAM.split(',') as UkefId[];

    const mockParams = {
      ids: mockIds,
    };

    it('should call giftFacilityService.getMany', async () => {
      // Act
      await controller.getManyWithoutQueue(mockParams);

      // Assert
      expect(mockServiceGetMany).toHaveBeenCalledTimes(1);

      expect(mockServiceGetMany).toHaveBeenCalledWith(mockIds);
    });

    it('should return data obtained from the service call', async () => {
      // Act
      const result = await controller.getManyWithoutQueue(mockParams);

      // Assert
      expect(result).toEqual(mockResponseGetMany);
    });
  });
});
