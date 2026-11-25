import { HttpStatus } from '@nestjs/common';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

type MockResponse = Partial<AxiosResponse>;

/**
 * Mock 200 response
 * @param {object} data
 * @returns {object}
 */
export const mockResponse200 = (data: object = {}) => ({
  status: HttpStatus.OK,
  data,
});

/**
 * Mock 201 response
 * @param {Object | Array<any>} data
 * @returns {object}
 */
export const mockResponse201 = (data: object | any[] = {}): MockResponse => ({
  status: HttpStatus.CREATED,
  data,
});

/**
 * Mock 204 response
 * @returns {object}
 */
export const mockResponse204 = (): MockResponse => ({
  status: HttpStatus.NO_CONTENT,
});

/**
 * Mock 400 response
 * @returns {object}
 */
export const mockResponse400 = (): MockResponse => ({
  status: HttpStatus.BAD_REQUEST,
});

/**
 * Mock 404 response
 * @returns {object}
 */
export const mockResponse404 = (): MockResponse => ({
  status: HttpStatus.NOT_FOUND,
});

/**
 * Mock 418 response
 * @returns {object}
 */
export const mockResponse418 = (): MockResponse => ({
  status: HttpStatus.I_AM_A_TEAPOT,
});

/**
 * Mock 500 response
 * @returns {object}
 */
export const mockResponse500 = (): MockResponse => ({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
});

/**
 * Mock Axios error.
 * @param {number} status
 * @param {object} data
 * @returns {AxiosError}
 */
export const mockAxiosError = ({ status = HttpStatus.CREATED, data = {} } = {}): AxiosError => {
  const request = { path: '/mock' };

  const headers = new AxiosHeaders();

  const config = {
    url: 'https://mock-url.com',
    headers,
  };

  return new AxiosError('Mock error message', 'Mock error code', config, request, {
    status,
    data,
    statusText: 'OK',
    config,
    headers,
  });
};
