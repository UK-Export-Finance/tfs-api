import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftService } from './gift.service';

const {
  GIFT: { FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const mockResponseGet = mockResponse200(FACILITY_RESPONSE_DATA);
const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftService', () => {
  let httpService: HttpService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponseGet);
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

    describe('when giftHttpService.get is successful', () => {
      it('should return the response of giftHttpService.get', async () => {
        const response = await service.getFacility(mockFacilityId);

        expect(response).toEqual(mockResponseGet);
      });
    });

    describe('when giftHttpService.get returns an error', () => {
      beforeEach(() => {
        mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

        httpService.get = mockHttpServiceGet;

        giftHttpService.get = mockHttpServiceGet;

        service = new GiftService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.getFacility(mockFacilityId);

        const expected = 'Error calling GIFT HTTP service GET method';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createFacility', () => {
    it('should call giftHttpService.post', async () => {
      await service.createFacility(mockPayload);

      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: GIFT.PATH.FACILITY,
        payload: mockPayload.overview,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        const response = await service.createFacility(mockPayload);

        expect(response).toEqual(mockResponsePost);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        httpService.post = mockHttpServicePost;

        giftHttpService.post = mockHttpServicePost;

        service = new GiftService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.createFacility(mockPayload);

        const expected = 'Error calling GIFT HTTP service POST method';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
