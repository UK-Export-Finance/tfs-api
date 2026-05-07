import axios from 'axios';
import { postToGiftApi } from '../utils/post-to-gift-api';

const tfsApiKey = process.env.TFS_API_KEY;

jest.mock('axios');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const url = 'https://mock-tfs-api.com/api/v2/gift/facility';
const errorPrefix = 'Failed to do something';

describe('postToGiftApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('posts the payload to the given URL with the correct headers', async () => {
    // Arrange
    const payload = { some: 'data' };

    axios.post = jest.fn().mockResolvedValue({ status: 201, data: {} });

    // Act
    await postToGiftApi(url, payload, errorPrefix, context as any);

    // Assert
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(url, payload, {
      headers: {
        'x-api-key': tfsApiKey,
        accept: 'application/json',
      },
    });
  });

  it('does not throw or log an error when the API responds with status 201', async () => {
    // Arrange
    axios.post = jest.fn().mockResolvedValue({ status: 201, data: {} });

    // Act
    await postToGiftApi(url, {}, errorPrefix, context as any);

    // Assert
    expect(context.error).not.toHaveBeenCalled();
  });

  it('logs an error and throws if the API responds with a non-201 status', async () => {
    // Arrange
    const responseData = { error: 'Bad Request' };

    axios.post = jest.fn().mockResolvedValue({ status: 400, data: responseData });

    // Act
    const call = () => postToGiftApi(url, {}, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(errorPrefix);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, status: 400, response: {"error":"Bad Request"}`);
  });

  it('logs an error and throws if axios throws an AxiosError', async () => {
    // Arrange
    const axiosError = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      response: { status: 500, data: { error: 'Internal Server Error' } },
    });

    axios.post = jest.fn().mockRejectedValue(axiosError);
    jest.mocked(axios.isAxiosError).mockReturnValue(true);

    // Act
    const call = () => postToGiftApi(url, {}, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, status: 500, error: Network Error, response: {"error":"Internal Server Error"}`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, status: 500, error: Network Error, response: {"error":"Internal Server Error"}`);
  });

  it('logs an error and throws if axios throws a plain Error', async () => {
    // Arrange
    axios.post = jest.fn().mockRejectedValue(new Error('Network Error'));

    // Act
    const call = () => postToGiftApi(url, {}, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, error: Network Error`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, error: Network Error`);
  });

  it('logs an error and throws if axios throws a non-Error', async () => {
    // Arrange
    axios.post = jest.fn().mockRejectedValue('unexpected string error');

    // Act
    const call = () => postToGiftApi(url, {}, errorPrefix, context as any);

    // Assert
    await expect(call()).rejects.toThrow(`${errorPrefix}, unknown error`);
    expect(context.error).toHaveBeenCalledWith(`${errorPrefix}, unknown error`);
  });
});
