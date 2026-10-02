import axios from 'axios';

import { getFromTfsApi } from '../utils/get-from-tfs-api';

const apimTfsUrl = process.env.APIM_TFS_URL;
const apimTfsKey = process.env.APIM_TFS_KEY;
const apimTfsValue = process.env.APIM_TFS_VALUE;

jest.mock('axios');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const path = '/api/v2/gift/facility/0011111111';
const params = {};
const errorPrefix = 'Failed to do something';

describe('getFromTfsApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('gets the resolved URL with the correct params and headers', async () => {
    // Arrange
    axios.get = jest.fn().mockResolvedValue({ status: 200, data: {} });

    // Act
    await getFromTfsApi(path, params, errorPrefix, context as any);

    // Assert
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${apimTfsUrl}${path}`, {
      params,
      headers: {
        [apimTfsKey]: apimTfsValue,
        accept: 'application/json',
      },
    });
  });

  it('passes query string params to axios so they are safely encoded', async () => {
    // Arrange
    axios.get = jest.fn().mockResolvedValue({ status: 200, data: {} });

    const idsParams = { ids: '0011111111,0022222222' };

    // Act
    await getFromTfsApi('/api/v2/gift/facilities', idsParams, errorPrefix, context as any);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(`${apimTfsUrl}/api/v2/gift/facilities`, {
      params: idsParams,
      headers: {
        [apimTfsKey]: apimTfsValue,
        accept: 'application/json',
      },
    });
  });

  it('returns the response data when the API responds with a 2xx status', async () => {
    // Arrange
    const responseData = { facilityId: '0011111111' };

    axios.get = jest.fn().mockResolvedValue({ status: 200, data: responseData });

    // Act
    const result = await getFromTfsApi(path, params, errorPrefix, context as any);

    // Assert
    expect(result).toStrictEqual(responseData);
    expect(context.error).not.toHaveBeenCalled();
  });

  it('returns the response data when the API responds with a 204 No Content status', async () => {
    // Arrange
    axios.get = jest.fn().mockResolvedValue({ status: 204, data: undefined });

    // Act
    const result = await getFromTfsApi(path, params, errorPrefix, context as any);

    // Assert
    expect(result).toBeUndefined();
    expect(context.error).not.toHaveBeenCalled();
  });

  it('logs an error and throws if axios throws an AxiosError', async () => {
    // Arrange
    const axiosError = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      response: { status: 500, data: { error: 'Internal Server Error' } },
    });

    axios.get = jest.fn().mockRejectedValue(axiosError);
    jest.mocked(axios.isAxiosError).mockReturnValue(true);

    // Act
    const call = () => getFromTfsApi(path, params, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, status: 500, error: Network Error, response: {"error":"Internal Server Error"}`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, status: 500, error: Network Error, response: {"error":"Internal Server Error"}`);
  });

  it('logs an error and throws if axios throws a plain Error', async () => {
    // Arrange
    axios.get = jest.fn().mockRejectedValue(new Error('Network Error'));

    // Act
    const call = () => getFromTfsApi(path, params, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, error: Network Error`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, error: Network Error`);
  });

  it('logs an error and throws if axios throws a non-Error', async () => {
    // Arrange
    axios.get = jest.fn().mockRejectedValue('unexpected string error');

    // Act
    const call = () => getFromTfsApi(path, params, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, unknown error`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, unknown error`);
  });
});
