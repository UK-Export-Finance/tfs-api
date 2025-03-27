import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';

import { GiftService } from './gift.service';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD: mockPayload, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftService', () => {
  let httpService: HttpService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponse200);
    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

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
        path: `${GIFT.PATH.FACILITY}/${mockFacilityId}`,
      });
    });

    it('should return the response of giftHttpService.get', async () => {
      const response = await service.getFacility(mockFacilityId);

      expect(response).toEqual(mockResponse200());
    });
  });

  describe('createFacility', () => {
    it('should call giftHttpService.post', async () => {
      await service.createFacility(mockPayload);

      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: GIFT.PATH.FACILITY,
        payload: mockPayload,
      });
    });

    it('should return the response of giftHttpService.post', async () => {
      const response = await service.createFacility(mockPayload);

      expect(response).toEqual(mockResponse200(mockPayload));
    });
  });
});
