import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';

import { GiftService } from './gift.service';

const mockFacilityId = EXAMPLES.GIFT.FACILITY.FACILITY_ID;

const mockGetResponse = {
  status: 200,
  data: {},
};

describe('GiftService', () => {
  let httpService: HttpService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockGetResponse);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
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
});
