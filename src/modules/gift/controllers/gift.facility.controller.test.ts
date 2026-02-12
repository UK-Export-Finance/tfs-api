import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAmendmentService,
  GiftFacilityAsyncValidationService,
  GiftFacilityService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftHttpService,
  GiftObligationService,
  GiftObligationSubtypeService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
  GiftWorkPackageService,
} from '../services';
import { GiftFacilityController } from './gift.facility.controller';

const {
  GIFT: { FACILITY_ID: mockFacilityId, FACILITY_CREATION_PAYLOAD, FACILITY_AMENDMENT_REQUEST_PAYLOAD },
} = EXAMPLES;

const mockResponseGet = mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);
const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockResponseAmendmentPost = mockResponse201(EXAMPLES.GIFT.WORK_PACKAGE_CREATION_RESPONSE_DATA);

describe('GiftFacilityController', () => {
  const logger = new PinoLogger({});

  let giftHttpService: GiftHttpService;
  let asyncValidationService: GiftFacilityAsyncValidationService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let giftFacilityService: GiftFacilityService;
  let giftFacilityAmendmentService: GiftFacilityAmendmentService;
  let giftWorkPackageService: GiftWorkPackageService;
  let controller: GiftFacilityController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetFacility;
  let mockServiceCreateFacility;
  let mockAmendmentServiceCreate;

  beforeEach(() => {
    // Arrange
    giftHttpService = new GiftHttpService(logger);

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
    giftWorkPackageService = new GiftWorkPackageService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    giftFacilityService = new GiftFacilityService(
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

    giftFacilityAmendmentService = new GiftFacilityAmendmentService(giftHttpService, logger, giftWorkPackageService);

    mockResSend = jest.fn();

    mockRes = {
      send: mockResSend,
    };

    mockResStatus = jest.fn(() => mockRes);

    mockRes.status = mockResStatus;

    mockServiceGetFacility = jest.fn().mockResolvedValueOnce(mockResponseGet);
    mockServiceCreateFacility = jest.fn().mockResolvedValueOnce(mockResponsePost);

    giftFacilityService.get = mockServiceGetFacility;
    giftFacilityService.create = mockServiceCreateFacility;

    mockAmendmentServiceCreate = jest.fn().mockResolvedValueOnce(mockResponseAmendmentPost);

    giftFacilityAmendmentService.create = mockAmendmentServiceCreate;

    controller = new GiftFacilityController(giftFacilityService, giftFacilityAmendmentService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET :facilityId', () => {
    const mockParams = { facilityId: mockFacilityId };

    it('should call giftFacilityService.getFacility', async () => {
      // Act
      await controller.get(mockParams, mockRes);

      // Assert
      expect(mockServiceGetFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceGetFacility).toHaveBeenCalledWith(mockFacilityId);
    });

    it('should call res.status with a status', async () => {
      // Act
      await controller.get(mockParams, mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponseGet.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      // Act
      await controller.get(mockParams, mockRes);

      // Assert
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponseGet.data);
    });
  });

  describe('POST :facilityId', () => {
    const mockBody = FACILITY_CREATION_PAYLOAD;

    it('should call giftFacilityService.create', async () => {
      // Act
      await controller.post(mockBody, mockRes);

      // Assert
      expect(mockServiceCreateFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceCreateFacility).toHaveBeenCalledWith(mockBody, mockBody.overview.facilityId);
    });

    it('should call res.status with a status', async () => {
      // Act
      await controller.post(mockBody, mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponsePost.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      // Act
      await controller.post(mockBody, mockRes);

      // Assert
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponsePost.data);
    });
  });

  describe('POST :facilityId/amendment', () => {
    const mockParams = { facilityId: mockFacilityId };
    const mockBody = FACILITY_AMENDMENT_REQUEST_PAYLOAD;

    it('should call giftFacilityAmendmentService.create', async () => {
      // Act
      await controller.postAmendment(mockParams, mockBody, mockRes);

      // Assert
      expect(mockAmendmentServiceCreate).toHaveBeenCalledTimes(1);

      expect(mockAmendmentServiceCreate).toHaveBeenCalledWith(mockFacilityId, mockBody);
    });

    it('should call res.status with a status', async () => {
      // Act
      await controller.postAmendment(mockParams, mockBody, mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponseAmendmentPost.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      // Act
      await controller.postAmendment(mockParams, mockBody, mockRes);

      // Assert
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponseAmendmentPost.data);
    });
  });
});
