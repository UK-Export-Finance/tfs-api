import { EXAMPLES } from '@ukef/constants';

import { GiftFacilityDto } from './dto';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

// TODO: DRY test mocks
const mockGiftFacility: GiftFacilityDto = {
  facilityId: FACILITY.FACILITY_ID,
  streamId: FACILITY.STREAM_ID,
  streamVersion: FACILITY.STREAM_VERSION,
  name: FACILITY.FACILITY_NAME,
  obligorUrn: FACILITY.OBLIGOR_URN,
  currency: FACILITY.CURRENCY,
  facilityAmount: FACILITY.FACILITY_AMOUNT,
  // drawnAmount: FACILITY.DRAWN_AMOUNT,
  // availableAmount: FACILITY.AVAILABLE_AMOUNT,
  effectiveDate: FACILITY.EFFECTIVE_DATE,
  expiryDate: FACILITY.EXPIRY_DATE,
  endOfCoverDate: FACILITY.END_OF_COVER_DATE,
  dealId: FACILITY.DEAL_ID,
  isRevolving: FACILITY.IS_REVOLVING,
  isDraft: FACILITY.IS_DRAFT,
  createdDatetime: FACILITY.CREATED_DATE_TIME,
  productType: 'MOCK',
};

const { facilityId } = mockGiftFacility;

const mockGetFacilityResponse = {
  status: 200,
  data: mockGiftFacility,
};

const mockCreateFacilityResponse = {
  status: 201,
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
  let mockServiceCreateFacility;

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
    mockServiceCreateFacility = jest.fn().mockResolvedValueOnce(mockCreateFacilityResponse);

    giftService.getFacility = mockServiceGetFacility;
    giftService.createFacility = mockServiceCreateFacility;

    controller = new GiftController(giftService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GET :facilityId', () => {
    it('should call giftService.getFacility', async () => {
      await controller.get({ facilityId }, mockRes);

      expect(mockServiceGetFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceGetFacility).toHaveBeenCalledWith(facilityId);
    });

    it('should call res.status with a status', async () => {
      await controller.get({ facilityId }, mockRes);

      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockGetFacilityResponse.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      await controller.get({ facilityId }, mockRes);

      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockGetFacilityResponse.data);
    });
  });

  describe('POST', () => {
    it('should call giftService.createFacility', async () => {
      await controller.get({ facilityId }, mockRes);

      expect(mockServiceCreateFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceCreateFacility).toHaveBeenCalledWith(facilityId);
    });

    it('should call res.status with a status', async () => {
      await controller.get({ facilityId }, mockRes);

      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockCreateFacilityResponse.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      await controller.get({ facilityId }, mockRes);

      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockCreateFacilityResponse.data);
    });
  });
});
