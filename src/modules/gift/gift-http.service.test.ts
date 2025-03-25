import giftConfig from '@ukef/config/gift.config';
import { HEADERS } from '@ukef/constants';
import axios from 'axios';
import * as dotenv from 'dotenv';

import { GIFT_API_ACCEPTABLE_STATUSES, GiftHttpService } from './gift-http.service';

dotenv.config();

const { CONTENT_TYPE } = HEADERS;

jest.mock('axios');

const mockAxios = jest.createMockFromModule<typeof axios>('axios');

let mockAxiosCreate = jest.fn();
let mockAxiosGet = jest.fn();
let mockAxiosPost = jest.fn();

mockAxiosCreate = jest.fn(() => ({
  ...mockAxios,
  get: mockAxiosGet,
  post: mockAxiosPost,
}));

const mockGetResponse = {
  status: 200,
  data: {},
};

const mockPostResponse = {
  status: 201,
  data: {},
};

describe('GiftHttpService', () => {
  let service: GiftHttpService;

  beforeEach(() => {
    axios.create = mockAxiosCreate;
    axios.get = mockAxiosGet;
    axios.post = mockAxiosPost;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GIFT_API_ACCEPTABLE_STATUSES', () => {
    it('should return an array of statuses', () => {
      const expected = [200, 201, 400, 404];

      expect(GIFT_API_ACCEPTABLE_STATUSES).toEqual(expected);
    });
  });

  describe('createAxiosInstance', () => {
    it('should call axios.create', () => {
      service = new GiftHttpService();

      service.createAxiosInstance();

      const { baseUrl, apiKeyHeaderName, apiKeyHeaderValue } = giftConfig();

      expect(mockAxiosCreate).toHaveBeenCalled();

      const expected = expect.objectContaining({
        baseURL: baseUrl,
        headers: {
          [apiKeyHeaderName]: apiKeyHeaderValue,
          [CONTENT_TYPE.KEY]: [CONTENT_TYPE.VALUES.JSON],
        },
      });

      expect(mockAxiosCreate).toHaveBeenCalledWith(expected);
    });
  });

  describe('get', () => {
    const mockGetPath = '/mock-get-path';

    beforeEach(() => {
      axios.create = mockAxiosCreate;

      mockAxiosGet = jest.fn().mockResolvedValue(mockGetResponse);

      service = new GiftHttpService();
    });

    it('should call axios.get', async () => {
      await service.get({ path: mockGetPath });

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);

      expect(mockAxiosGet).toHaveBeenCalledWith(mockGetPath);
    });

    it('should return the result of axios.get', async () => {
      const response = await service.get({ path: mockGetPath });

      expect(response).toEqual(mockGetResponse);
    });
  });

  describe('post', () => {
    const mockPostPath = '/mock-post-path';

    const mockPayload = { mock: true };

    beforeEach(() => {
      axios.create = mockAxiosCreate;

      mockAxiosPost = jest.fn().mockResolvedValue(mockPostResponse);

      service = new GiftHttpService();
    });

    it('should call axios.post', async () => {
      await service.post({ path: mockPostPath, payload: mockPayload });

      expect(mockAxiosPost).toHaveBeenCalledTimes(1);

      expect(mockAxiosPost).toHaveBeenCalledWith(mockPostPath);
    });

    it('should return the result of axios.post', async () => {
      const response = await service.post({ path: mockPostPath, payload: mockPayload });

      expect(response).toEqual(mockPostResponse);
    });
  });
});
