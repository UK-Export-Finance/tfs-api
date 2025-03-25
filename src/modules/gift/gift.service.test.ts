import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';

import { GiftFacilityCreationDto } from './dto';
import { GiftService } from './gift.service';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

const mockFacilityId = FACILITY.FACILITY_ID;

// TODO: DRY test mocks
const mockGiftFacility: GiftFacilityCreationDto = {
  overview: {
    facilityId: mockFacilityId,
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
  },
};

const mockGetResponse = {
  status: 200,
  data: {},
};

const mockPostResponse = {
  status: 200,
  data: mockGiftFacility.overview,
};

describe('GiftService', () => {
  let httpService: HttpService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockPostResponse);

    httpService.get = mockHttpServiceGet;
    httpService.post = mockHttpServicePost;

    giftHttpService = {
      get: mockHttpServiceGet,
      post: mockHttpServicePost,
    };

    service = new GiftService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getFacility', () => {
    it('should call giftHttpService.get', async () => {
      await service.getFacility(mockFacilityId);

      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({
        path: `${GIFT.PATH.FACILITY}${mockFacilityId}`,
      });
    });

    it('should return the response of giftHttpService.get', async () => {
      const response = await service.getFacility(mockFacilityId);

      expect(response).toEqual(mockGetResponse);
    });
  });

  describe('createFacility', () => {
    it('should call giftHttpService.post', async () => {
      await service.createFacility(mockGiftFacility);

      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: GIFT.PATH.FACILITY,
        payload: mockGiftFacility,
      });
    });

    it('should return the response of giftHttpService.post', async () => {
      const response = await service.createFacility(mockGiftFacility);

      expect(response).toEqual(mockPostResponse);
    });
  });
});
