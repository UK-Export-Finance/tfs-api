import { HttpStatus } from '@nestjs/common';
import { AxiosError, AxiosHeaders } from 'axios';

/**
 * Mock 200 response
 * @param {Object} data
 * @returns {Object}
 */
export const mockResponse200 = (data: object = {}) => ({
  status: HttpStatus.OK,
  data,
});

/**
 * Mock 201 response
 * @param {Object} data
 * @returns {Object}
 */
export const mockResponse201 = (data: object = {}) => ({
  status: HttpStatus.CREATED,
  data,
});

/**
 * Mock 500 response
 * @returns {Object}
 */
export const mockResponse500 = () => ({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
});

/**
 * Mock Axios error.
 * @param {Number} status
 * @param {Object} data
 * @returns {AxiosError}
 */
export const mockAxiosError = ({ status = HttpStatus.CREATED, data = {} } = {}): AxiosError => {
  const request = { path: '/mock' };

  const headers = new AxiosHeaders();

  const config = {
    url: 'https://mock-url.com',
    headers,
  };

  return new AxiosError('Mock message', 'Mock code', config, request, {
    status,
    data,
    statusText: 'OK',
    config,
    headers,
  });
};
