import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFacilityController } from './gift.facility.controller';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

const {
  GIFT: { FACILITY_ID: mockFacilityId, FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

const mockResponseGet = mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);
const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftFacilityController', () => {
  let giftHttpService: GiftHttpService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let giftService: GiftService;
  let controller: GiftFacilityController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetFacility;
  let mockServiceCreateFacility;

  beforeEach(() => {
    // Arrange
    giftHttpService = new GiftHttpService();

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    fixedFeeService = new GiftFixedFeeService(giftHttpService);
    obligationService = new GiftObligationService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    giftService = new GiftService(giftHttpService, counterpartyService, fixedFeeService, obligationService, repaymentProfileService);

    mockResSend = jest.fn();

    mockRes = {
      send: mockResSend,
    };

    mockResStatus = jest.fn(() => mockRes);

    mockRes.status = mockResStatus;

    mockServiceGetFacility = jest.fn().mockResolvedValueOnce(mockResponseGet);
    mockServiceCreateFacility = jest.fn().mockResolvedValueOnce(mockResponsePost);

    giftService.getFacility = mockServiceGetFacility;
    giftService.createFacility = mockServiceCreateFacility;

    controller = new GiftFacilityController(giftService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET :facilityId', () => {
    it('should call giftService.getFacility', async () => {
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
    it('should call giftService.createFacility', async () => {
      // Act
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      // Assert
      expect(mockServiceCreateFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceCreateFacility).toHaveBeenCalledWith(FACILITY_CREATION_PAYLOAD);
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
