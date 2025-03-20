import { EXAMPLES } from '@ukef/constants';

import { GiftFacilityDto } from './dto';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

const mockFacilityId = FACILITY.FACILITY_ID;

const mockGiftFacility: GiftFacilityDto = {
  facilityId: mockFacilityId,
  streamId: FACILITY.STREAM_ID,
  streamVersion: FACILITY.STREAM_VERSION,
  name: FACILITY.FACILITY_NAME,
  obligorUrn: FACILITY.OBLIGOR_URN,
  currency: FACILITY.CURRENCY,
  facilityAmount: FACILITY.FACILITY_AMOUNT,
  drawnAmount: FACILITY.DRAWN_AMOUNT,
  availableAmount: FACILITY.AVAILABLE_AMOUNT,
  effectiveDate: FACILITY.EFFECTIVE_DATE,
  expiryDate: FACILITY.EXPIRY_DATE,
  endOfCoverDate: FACILITY.END_OF_COVER_DATE,
  dealId: FACILITY.DEAL_ID,
  isRevolving: FACILITY.IS_REVOLVING,
  isDraft: FACILITY.IS_DRAFT,
  createdDatetime: FACILITY.CREATED_DATE_TIME,
};

const mockGetFacilityResponse = {
  status: 200,
  data: mockGiftFacility,
};

describe('GiftController', () => {
  let giftHttpService: GiftHttpService;
  let giftService: GiftService;
  let controller: GiftController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetFacility;

  beforeEach(() => {
    giftHttpService = new GiftHttpService();
    giftService = new GiftService(giftHttpService);

    mockResSend = jest.fn();

    mockRes = {
      send: mockResSend,
    };

    mockResStatus = jest.fn(() => mockRes);

    mockRes.status = mockResStatus;

    mockServiceGetFacility = jest.fn().mockResolvedValueOnce(mockGetFacilityResponse);

    giftService.getFacility = mockServiceGetFacility;

    controller = new GiftController(giftService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET :facilityId', () => {
    beforeEach(async () => {
      await controller.get(mockFacilityId, mockRes);
    });

    it('should call giftService.getFacility', () => {
      expect(mockServiceGetFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceGetFacility).toHaveBeenCalledWith(mockFacilityId);
    });

    it('should call res.status with a status', () => {
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockGetFacilityResponse.status);
    });

    it('should call res.status.send with data obtained from the service call', () => {
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockGetFacilityResponse.data);
    });
  });
});
