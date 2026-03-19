import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { when } from 'jest-when';
import { ObservableInput, of, throwError } from 'rxjs';

import { HttpClient } from './http.client';

describe('HttpClient', () => {
  const valueGenerator = new RandomValueGenerator();

  let httpServiceGet: jest.Mock;
  let client: HttpClient;

  beforeEach(() => {
    const httpService = new HttpService();
    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    client = new HttpClient(httpService);
  });

  describe('get', () => {
    const path = `/${valueGenerator.word()}/${valueGenerator.word()}`;
    const headers = {
      [valueGenerator.word()]: valueGenerator.string(),
      [valueGenerator.word()]: valueGenerator.string(),
    };

    const expectedApimHeaders = {
      [process.env.APIM_MDM_KEY]: process.env.APIM_MDM_VALUE,
    };

    const queryParams = {
      [valueGenerator.word()]: valueGenerator.string(),
      [valueGenerator.word()]: valueGenerator.string(),
    };

    const expectedHttpServiceGetArgs: [string, object] = [path, { headers: expectedApimHeaders, params: queryParams }];
    const expectedHttpServiceGetArgsWithoutHeaders: [string, object] = [path, { headers: expectedApimHeaders, params: queryParams }];
    const expectedHttpServiceGetArgsWithoutQueryParams: [string, object] = [path, { headers: expectedApimHeaders }];
    const expectedHttpServiceGetArgsWithoutQueryParamsAndHeaders: [string, object] = [path, { headers: expectedApimHeaders }];

    const response: AxiosResponse = {
      data: {
        someField: valueGenerator.nonnegativeInteger(),
      },
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
      statusText: 'OK',
      config: {} as InternalAxiosRequestConfig,
      request: {},
    };

    let onError: (error: Error) => ObservableInput<never>;

    beforeEach(() => {
      onError = jest.fn();
    });

    describe('when the HttpService succeeds', () => {
      beforeEach(() => {
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgs)
          .mockReturnValueOnce(of(response));
      });

      it('should return the same response', async () => {
        const result = await client.get({
          path,
          queryParams,
          headers,
          onError,
        });

        expect(result).toBe(response);
      });

      it('should NOT call onError', async () => {
        await client.get({
          path,
          queryParams,
          headers,
          onError,
        });

        expect(onError).not.toHaveBeenCalled();
      });
    });

    describe('when headers are not provided', () => {
      beforeEach(() => {
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgsWithoutHeaders)
          .mockReturnValueOnce(of(response));
      });

      it('should call HttpService.get with APIM headers in config', async () => {
        await client.get({
          path,
          queryParams,
          onError,
        });

        expect(httpServiceGet).toHaveBeenCalledWith(...expectedHttpServiceGetArgsWithoutHeaders);
      });

      it('should return the same response', async () => {
        const result = await client.get({
          path,
          queryParams,
          onError,
        });

        expect(result).toBe(response);
      });
    });

    describe('when the HttpService errors', () => {
      const errorFromHttpService = new Error('Test error from HttpService');
      const errorThatOnErrorThrows = new Error('Test error from onError');

      beforeEach(() => {
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgs)
          .mockReturnValueOnce(throwError(() => errorFromHttpService));
        when(onError)
          .calledWith(errorFromHttpService)
          .mockImplementationOnce(() => throwError(() => errorThatOnErrorThrows));
      });

      it('should call onError with the error that HttpService errored with', async () => {
        await client
          .get({
            path,
            queryParams,
            headers,
            onError,
          })
          .catch(() => {
            /* error ignored for test */
          });

        expect(onError).toHaveBeenCalledWith(errorFromHttpService);
        expect(onError).toHaveBeenCalledTimes(1);
      });

      it('should reject with the error that onError throws', async () => {
        const clientGetPromise = client.get({
          path,
          queryParams,
          headers,
          onError,
        });

        await expect(clientGetPromise).rejects.toBe(errorThatOnErrorThrows);
      });
    });

    describe('when queryParams are not provided', () => {
      it('should call HttpService.get without params when headers are provided', async () => {
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgsWithoutQueryParams)
          .mockReturnValueOnce(of(response));

        await client.get({
          path,
          headers,
          onError,
        });

        expect(httpServiceGet).toHaveBeenCalledWith(...expectedHttpServiceGetArgsWithoutQueryParams);
      });

      it('should call HttpService.get with APIM headers when headers are not provided', async () => {
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgsWithoutQueryParamsAndHeaders)
          .mockReturnValueOnce(of(response));

        await client.get({
          path,
          onError,
        });

        expect(httpServiceGet).toHaveBeenCalledWith(...expectedHttpServiceGetArgsWithoutQueryParamsAndHeaders);
      });
    });
  });
});
