import { HttpModule as AxiosHttpModule, HttpService } from '@nestjs/axios';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';

import { HttpModule } from './http.module';
import { logAxiosRequestWith } from './log-axios-request.axios-interceptor';
import { logAxiosResponseErrorWith } from './log-axios-response-error.axios-interceptor';
import { logAxiosResponseSuccessWith } from './log-axios-response-success.axios-interceptor';

jest.mock('./log-axios-request.axios-interceptor');
jest.mock('./log-axios-response-error.axios-interceptor');
jest.mock('./log-axios-response-success.axios-interceptor');

describe('HttpModule', () => {
  describe('constructor', () => {
    const axiosRequestInterceptor = jest.fn();
    const axiosResponseSuccessInterceptor = jest.fn();
    const axiosResponseErrorInterceptor = jest.fn();

    let httpService: HttpService;
    let logger: PinoLogger;

    const createNewHttpModule = () => new HttpModule(httpService, logger);

    beforeEach(() => {
      httpService = httpService = {
        axiosRef: {
          interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
          },
        },
      } as unknown as HttpService;
      logger = new PinoLogger({});
      when(logAxiosRequestWith).calledWith(logger).mockReturnValueOnce(axiosRequestInterceptor);
      when(logAxiosResponseSuccessWith).calledWith(logger).mockReturnValueOnce(axiosResponseSuccessInterceptor);
      when(logAxiosResponseErrorWith).calledWith(logger).mockReturnValueOnce(axiosResponseErrorInterceptor);
    });

    it('registers the request and response logging interceptors on the axiosRef of the httpService', () => {
      createNewHttpModule();

      const [requestInterceptorUseArgs] = (httpService.axiosRef.interceptors.request.use as jest.Mock).mock.calls;
      const [requestInterceptor] = requestInterceptorUseArgs;
      const [responseInterceptorsUseArgs] = (httpService.axiosRef.interceptors.response.use as jest.Mock).mock.calls;
      const [responseSuccessInterceptor, responseErrorInterceptor] = responseInterceptorsUseArgs;

      expect(requestInterceptor).toBe(axiosRequestInterceptor);
      expect(responseSuccessInterceptor).toBe(axiosResponseSuccessInterceptor);
      expect(responseErrorInterceptor).toBe(axiosResponseErrorInterceptor);
    });
  });

  describe('registerAsync', () => {
    const imports = [ConfigModule];
    const inject = [ConfigService];
    const useFactory = jest.fn();
    const dynamicAxiosHttpModule: DynamicModule = {
      module: AxiosHttpModule,
    };

    beforeEach(() => {
      const axiosHttpModuleRegisterAsync = jest.fn();
      AxiosHttpModule.registerAsync = axiosHttpModuleRegisterAsync;
      when(axiosHttpModuleRegisterAsync)
        .calledWith({
          imports,
          inject,
          useFactory,
        })
        .mockReturnValueOnce(dynamicAxiosHttpModule);
    });

    const registerAsync = (): DynamicModule =>
      HttpModule.registerAsync({
        imports,
        inject,
        useFactory,
      });

    it('specifies only module, imports, and exports', () => {
      const module = registerAsync();

      const sortedModuleKeys = Object.keys(module).sort((a, b) => a.localeCompare(b));

      expect(sortedModuleKeys).toStrictEqual(['exports', 'imports', 'module']);
    });

    it('specifies the module field as the class', () => {
      const module = registerAsync();

      expect(module.module).toBe(HttpModule);
    });

    it('imports only the dynamic Axios HttpModule', () => {
      const module = registerAsync();

      expect(module.imports).toStrictEqual([dynamicAxiosHttpModule]);
    });

    it('exports only the AxiosHttpModule', () => {
      const module = registerAsync();

      expect(module.exports).toStrictEqual([AxiosHttpModule]);
    });
  });
});
