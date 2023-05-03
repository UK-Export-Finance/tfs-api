import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { filterAxiosResponseForLogging } from './filter-axios-response-for-logging.helper';
import { AxiosResponseSuccessInterceptor } from './type/axios-response-success-interceptor.type';

export const logAxiosResponseSuccessWith =
  (logger: PinoLogger): AxiosResponseSuccessInterceptor =>
  (response: AxiosResponse) => {
    logger.debug({ response: filterAxiosResponseForLogging(response) }, 'Received successful HTTP response.');
    return response;
  };
