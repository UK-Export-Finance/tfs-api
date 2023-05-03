import { InternalAxiosRequestConfig } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { filterAxiosRequestForLogging } from './filter-axios-request-for-logging.helper';
import { AxiosRequestInterceptor } from './type/axios-request-interceptor.type';

export const logAxiosRequestWith =
  (logger: PinoLogger): AxiosRequestInterceptor =>
  (config: InternalAxiosRequestConfig) => {
    logger.debug({ outgoingRequest: filterAxiosRequestForLogging(config) }, 'Sending the following HTTP request.');
    return config;
  };
