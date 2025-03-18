import { HttpService } from '@nestjs/axios';
import { EXAMPLES } from '@ukef/constants';

import { GiftService } from './gift.service';

const mockFacilityId = EXAMPLES.GIFT.FACILITY_ID;

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
    let response;

    beforeEach(async () => {
      response = await service.getFacility(mockFacilityId);
    });

    it('should call giftHttpService.get', () => {
      expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

      expect(mockHttpServiceGet).toHaveBeenCalledWith({
        path: `/facility/${mockFacilityId}`,
      });
    });

    it('should return the response of giftHttpService.get', () => {
      const expected = mockGetResponse;

      expect(response).toEqual(expected);
    });
  });
});
