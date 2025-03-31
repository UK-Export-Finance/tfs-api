import { HttpStatus, Injectable } from '@nestjs/common';
import giftConfig, { GiftConfig } from '@ukef/config/gift.config';
import { HEADERS } from '@ukef/constants';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const { CONTENT_TYPE } = HEADERS;

/**
 * Array of acceptable statuses to consume from a GIFT API response
 * @returns {Array<HttpStatus>}
 */
export const GIFT_API_ACCEPTABLE_STATUSES = [HttpStatus.OK, HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND];

/**
 * GIFT HTTP service.
 * This is responsible for all CRUD calls made to the external GIFT API.
 */
@Injectable()
export class GiftHttpService {
  private axiosInstance: AxiosInstance;
  private readonly config: GiftConfig;

  constructor() {
    this.config = giftConfig();

    this.axiosInstance = this.createAxiosInstance();
  }

  /**
   * Create a new Axios instance
   * @returns {AxiosInstance}
   */
  createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        [this.config.apiKeyHeaderName]: this.config.apiKeyHeaderValue,
        [CONTENT_TYPE.KEY]: [CONTENT_TYPE.VALUES.JSON],
      },
      validateStatus: (status) => GIFT_API_ACCEPTABLE_STATUSES.includes(status),
    });

    return instance;
  }

  /**
   * Execute a GET axios/HTTP request
   * @param {String} path
   * @returns {Promise<AxiosResponse<T>>}
   */
  async get<T>({ path }: { path: string }): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.get(path);

      return response;
    } catch (error) {
      console.error(`Error calling GET with path %s ${path} %o`, error);

      throw new Error(`Error calling GET with path %s ${path}`, error);
    }
  }

  /**
   * Execute a POST axios/HTTP request
   * @param {String} path
   * @param {Object} payload
   * @returns {Promise<AxiosResponse<T>>}
   */
  async post<T>({ path, payload }: { path: string; payload: object }): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.post(path, payload);

      return response;
    } catch (error) {
      console.error(`Error calling POST with path %s ${path} %o`, error);

      throw new Error(`Error calling POST with path %s ${path}`, error);
    }
  }
}
