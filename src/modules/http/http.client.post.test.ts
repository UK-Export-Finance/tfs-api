import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { when } from 'jest-when';
import { ObservableInput, of, throwError } from 'rxjs';

import { HttpClient } from './http.client';

describe('HttpClient', () => {
  const valueGenerator = new RandomValueGenerator();

  let httpServicePost: jest.Mock;
  let client: HttpClient;

  beforeEach(() => {
    const httpService = new HttpService();
    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    client = new HttpClient(httpService);
  });

  describe('post', () => {
    const path = `/${valueGenerator.word()}/${valueGenerator.word()}`;
    const headers = {
      [valueGenerator.word()]: valueGenerator.string(),
      [valueGenerator.word()]: valueGenerator.string(),
    };
    const requestBody = {
      field1: 'data1',
      field2: 'data2',
    };

    const expectedHttpServicePostArgs: [string, object, object] = [path, requestBody, { headers }];

    const response: AxiosResponse = {
      data: {
        someField: valueGenerator.nonnegativeInteger(),
      },
      headers: {
        Location: valueGenerator.httpsUrl(),
      },
      status: 201,
      statusText: 'Created',
      config: {} as InternalAxiosRequestConfig,
      request: {},
    };

    let onError: (error: Error) => ObservableInput<never>;

    beforeEach(() => {
      onError = jest.fn();
    });

    describe('when the HttpService succeeds', () => {
      beforeEach(() => {
        when(httpServicePost)
          .calledWith(...expectedHttpServicePostArgs)
          .mockReturnValueOnce(of(response));
      });

      it('resolves with the same response', async () => {
        const result = await client.post({
          path,
          requestBody,
          headers,
          onError,
        });

        expect(result).toBe(response);
      });

      it('does not call onError', async () => {
        await client.post({
          path,
          requestBody,
          headers,
          onError,
        });

        expect(onError).not.toHaveBeenCalled();
      });
    });

    describe('when the HttpService errors', () => {
      const errorFromHttpService = new Error('Test error from HttpService');
      const errorThatOnErrorThrows = new Error('Test error from onError');

      beforeEach(() => {
        when(httpServicePost)
          .calledWith(...expectedHttpServicePostArgs)
          .mockReturnValueOnce(throwError(() => errorFromHttpService));
        when(onError)
          .calledWith(errorFromHttpService)
          .mockImplementationOnce(() => throwError(() => errorThatOnErrorThrows));
      });

      it('calls onError with the error that HttpService errored with', async () => {
        await client
          .post({
            path,
            requestBody,
            headers,
            onError,
          })
          .catch(() => {
            /* error ignored for test */
          });

        expect(onError).toHaveBeenCalledWith(errorFromHttpService);
        expect(onError).toHaveBeenCalledTimes(1);
      });

      it('rejects with the error that onError throws', async () => {
        const clientPostPromise = client.post({
          path,
          requestBody,
          headers,
          onError,
        });

        await expect(clientPostPromise).rejects.toBe(errorThatOnErrorThrows);
      });
    });
  });
});
