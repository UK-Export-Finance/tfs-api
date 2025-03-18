import giftConfig from '@ukef/config/gift.config';
import axios from 'axios';
import * as dotenv from 'dotenv';

import { ACCEPTABLE_STATUSES, GiftHttpService } from './gift-http.service';

dotenv.config();

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

  describe('ACCEPTABLE_STATUSES', () => {
    it('should return an array of statuses', () => {
      const expected = [200, 400, 404];

      expect(ACCEPTABLE_STATUSES).toEqual(expected);
    });
  });

  describe('when instantiating the service', () => {
    it('should call axios.create', () => {
      new GiftHttpService();

      const { baseUrl, apiKeyHeaderName, apiKeyHeaderValue } = giftConfig();

      expect(mockAxiosCreate).toHaveBeenCalledTimes(1);

      const expected = expect.objectContaining({
        baseURL: baseUrl,
        headers: {
          [apiKeyHeaderName]: apiKeyHeaderValue,
          'Content-Type': 'application/json',
        },
      });

      expect(mockAxiosCreate).toHaveBeenCalledWith(expected);
    });
  });

  describe('get', () => {
    let response;

    const mockPath = '/mock-path';

    const mockGetResponse = {
      status: 200,
      data: {},
    };

    beforeEach(async () => {
      axios.create = mockAxiosCreate;

      mockAxiosGet = jest.fn().mockResolvedValue(mockGetResponse);

      service = new GiftHttpService();

      response = await service.get({ path: mockPath });
    });

    it('should call axios.get', () => {
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);

      expect(mockAxiosGet).toHaveBeenCalledWith(mockPath);
    });

    it('should return the result of axios.get', () => {
      const expected = mockGetResponse;

      expect(response).toEqual(expected);
    });
  });
});
