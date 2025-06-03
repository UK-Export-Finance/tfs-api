import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFacilityController } from './gift.facility.controller';
import { GiftFacilityService } from './gift.facility.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftHttpService } from './gift.http.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftStatusService } from './gift.status.service';

const {
  GIFT: { FACILITY_ID: mockFacilityId, FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

const mockResponseGet = mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);
const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftFacilityController', () => {
  const logger = new PinoLogger({});

  let giftHttpService: GiftHttpService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let giftFacilityService: GiftFacilityService;
  let controller: GiftFacilityController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetFacility;
  let mockServiceCreateFacility;

  beforeEach(() => {
    // Arrange
    giftHttpService = new GiftHttpService(logger);

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    giftFacilityService = new GiftFacilityService(
      giftHttpService,
      logger,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      statusService,
    );

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

    controller = new GiftFacilityController(giftFacilityService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET :facilityId', () => {
    it('should call giftFacilityService.getFacility', async () => {
      // Act
      await controller.get({ facilityId: mockFacilityId }, mockRes);

      // Assert
      expect(mockServiceGetFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceGetFacility).toHaveBeenCalledWith(mockFacilityId);
    });

    it('should call res.status with a status', async () => {
      // Act
      await controller.get({ facilityId: mockFacilityId }, mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponseGet.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      // Act
      await controller.get({ facilityId: mockFacilityId }, mockRes);

      // Assert
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponseGet.data);
    });
  });

  describe('POST', () => {
    it('should call giftFacilityService.create', async () => {
      // Act
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      // Assert
      expect(mockServiceCreateFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceCreateFacility).toHaveBeenCalledWith(FACILITY_CREATION_PAYLOAD, FACILITY_CREATION_PAYLOAD.overview.facilityId);
    });

    it('should call res.status with a status', async () => {
      // Act
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponsePost.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      // Act
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      // Assert
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponsePost.data);
    });
  });
});
