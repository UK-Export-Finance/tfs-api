import axios from 'axios';

import { HttpStatus } from '../constants/http-status.constant';
import { getFromTfsApi } from '../utils/get-from-tfs-api';

const apimTfsKey = process.env.APIM_TFS_KEY;
const apimTfsValue = process.env.APIM_TFS_VALUE;

jest.mock('axios');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const url = 'https://mock-tfs-api.com/api/v2/gift/facility/0011111111';
const errorPrefix = 'Failed to do something';

describe('getFromTfsApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('gets the given URL with the correct headers', async () => {
    // Arrange
    axios.get = jest.fn().mockResolvedValue({ status: HttpStatus.OK, data: {} });

    // Act
    await getFromTfsApi(url, errorPrefix, context as any);

    // Assert
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(url, {
      headers: {
        [apimTfsKey]: apimTfsValue,
        accept: 'application/json',
      },
    });
  });

  it(`returns the response data when the API responds with status ${HttpStatus.OK}`, async () => {
    // Arrange
    const responseData = { facilityId: '0011111111' };

    axios.get = jest.fn().mockResolvedValue({ status: HttpStatus.OK, data: responseData });

    // Act
    const result = await getFromTfsApi(url, errorPrefix, context as any);

    // Assert
    expect(result).toStrictEqual(responseData);
    expect(context.error).not.toHaveBeenCalled();
  });

  it(`logs an error and throws if the API responds with a non-${HttpStatus.OK} status`, async () => {
    // Arrange
    const responseData = { error: 'Not Found' };

    axios.get = jest.fn().mockResolvedValue({ status: 404, data: responseData });

    // Act
    const call = () => getFromTfsApi(url, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, status: 404, response: {"error":"Not Found"}`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, status: 404, response: {"error":"Not Found"}`);
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
    const call = () => getFromTfsApi(url, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, status: 500, error: Network Error, response: {"error":"Internal Server Error"}`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, status: 500, error: Network Error, response: {"error":"Internal Server Error"}`);
  });

  it('logs an error and throws if axios throws a plain Error', async () => {
    // Arrange
    axios.get = jest.fn().mockRejectedValue(new Error('Network Error'));

    // Act
    const call = () => getFromTfsApi(url, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, error: Network Error`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, error: Network Error`);
  });

  it('logs an error and throws if axios throws a non-Error', async () => {
    // Arrange
    axios.get = jest.fn().mockRejectedValue('unexpected string error');

    // Act
    const call = () => getFromTfsApi(url, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, unknown error`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, unknown error`);
  });
});
