import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';

import { GiftController } from './gift.controller';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

const {
  GIFT: { FACILITY_ID: mockFacilityId, FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

const mockResponseGet = mockResponse200(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);
const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftController', () => {
  let giftHttpService: GiftHttpService;
  let counterpartyService: GiftCounterpartyService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let giftService: GiftService;
  let controller: GiftController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetFacility;
  let mockServiceCreateFacility;

  beforeEach(() => {
    giftHttpService = new GiftHttpService();

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    obligationService = new GiftObligationService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    giftService = new GiftService(giftHttpService, counterpartyService, obligationService, repaymentProfileService);

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

    controller = new GiftController(giftService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET :facilityId', () => {
    it('should call giftService.getFacility', async () => {
      await controller.get({ facilityId: mockFacilityId }, mockRes);

      expect(mockServiceGetFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceGetFacility).toHaveBeenCalledWith(mockFacilityId);
    });

    it('should call res.status with a status', async () => {
      await controller.get({ facilityId: mockFacilityId }, mockRes);

      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponseGet.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      await controller.get({ facilityId: mockFacilityId }, mockRes);

      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponseGet.data);
    });
  });

  describe('POST', () => {
    it('should call giftService.createFacility', async () => {
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      expect(mockServiceCreateFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceCreateFacility).toHaveBeenCalledWith(FACILITY_CREATION_PAYLOAD);
    });

    it('should call res.status with a status', async () => {
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponsePost.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      await controller.post(FACILITY_CREATION_PAYLOAD, mockRes);

      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponsePost.data);
    });
  });
});
