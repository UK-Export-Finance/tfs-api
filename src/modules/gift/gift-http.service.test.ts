import giftConfig from '@ukef/config/gift.config';
import { HEADERS } from '@ukef/constants';
import axios from 'axios';
import * as dotenv from 'dotenv';

import { GIFT_API_ACCEPTABLE_STATUSES, GiftHttpService } from './gift-http.service';

dotenv.config();

const { CONTENT_TYPE } = HEADERS;

jest.mock('axios');

const mockAxios = jest.createMockFromModule<typeof axios>('axios');

let mockAxiosGet = jest.fn();

let mockAxiosCreate = jest.fn();

mockAxiosCreate = jest.fn(() => ({
  ...mockAxios,
  get: mockAxiosGet,
}));

describe('GiftHttpService', () => {
  let service: GiftHttpService;

  beforeEach(() => {
    axios.create = mockAxiosCreate;
    axios.get = mockAxiosGet;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('GIFT_API_ACCEPTABLE_STATUSES', () => {
    it('should return an array of statuses', () => {
      const expected = [200, 400, 404];

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
    const mockPath = '/mock-path';

    const mockGetResponse = {
      status: 200,
      data: {},
    };

    beforeEach(() => {
      axios.create = mockAxiosCreate;

      mockAxiosGet = jest.fn().mockResolvedValue(mockGetResponse);

      service = new GiftHttpService();
    });

    it('should call axios.get', async () => {
      await service.get({ path: mockPath });

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);

      expect(mockAxiosGet).toHaveBeenCalledWith(mockPath);
    });

    it('should return the result of axios.get', async () => {
      const response = await service.get({ path: mockPath });

      expect(response).toEqual(mockGetResponse);
    });
  });
});
