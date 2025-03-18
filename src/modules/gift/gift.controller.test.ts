import { EXAMPLES } from '@ukef/constants';

import { GiftFacilityDto } from './dto';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

const mockFacilityId = EXAMPLES.GIFT.FACILITY_ID;

const mockGiftFacility: GiftFacilityDto = {
  facilityId: mockFacilityId,
  streamId: '7d915bfa-0069-4aaa-92c5-013925f019a1',
  streamVersion: 1,
  name: 'Mock facility name',
  obligorUrn: '01234567',
  currency: 'GBP',
  facilityAmount: 0,
  drawnAmount: 0,
  availableAmount: 0,
  effectiveDate: '2025-01-01',
  expiryDate: '2025-02-01',
  endOfCoverDate: '2025-03-01',
  dealId: '9988776655',
  isRevolving: true,
  isDraft: true,
  createdDatetime: '2025-01-01T13:03:54.123Z',
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
    let response;

    beforeEach(async () => {
      response = await controller.get(mockFacilityId, mockRes);
    });

    it('should call giftService.getFacility', () => {
      expect(mockServiceGetFacility).toHaveBeenCalledTimes(1);

      expect(mockServiceGetFacility).toHaveBeenCalledWith(mockFacilityId);
    });

    it('should call res.status with a status', () => {
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockGetFacilityResponse.status);
    });

    it('should call res.status.send with data', () => {
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockGetFacilityResponse.data);
    });

    it('should return data from giftService.getFacility', () => {
      const expected = mockGetFacilityResponse.data;

      expect(response).toEqual(expected);
    });
  });
});
