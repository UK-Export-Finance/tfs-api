import { Injectable } from '@nestjs/common';
import giftConfig, { GiftConfig } from '@ukef/config/gift.config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

/**
 * Array of acceptable statuses to consume from a GIFT API response
 * @returns {Array<number>}
 */
export const ACCEPTABLE_STATUSES = [200, 400, 404];

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
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => ACCEPTABLE_STATUSES.includes(status),
    });

    return instance;
  }

  /**
   * Execute a GET axios/HTTP request
   * @param {String} path
   * @returns {Promise<AxiosResponse<T>>}
   */
  async get<T>({ path }: { path: string }): Promise<AxiosResponse<T>> {
    const response = await this.axiosInstance.get(path);

    return response;
  }
}
