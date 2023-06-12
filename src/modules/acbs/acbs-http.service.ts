import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput } from 'rxjs';

import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from './acbs-config-base-url.type';

export class AcbsHttpService {
  constructor(private readonly config: AcbsConfigBaseUrlAndUseReturnExceptionHeader, private readonly httpService: HttpService) {}

  private getRequestConfig({ method, idToken }: { method: 'get' | 'post' | 'put'; idToken: string }): AxiosRequestConfig {
    const baseRequestConfig: AxiosRequestConfig = {
      baseURL: this.config.baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    };
    if (this.config.useReturnExceptionHeader) {
      baseRequestConfig.headers.ReturnException = true;
    }
    switch (method) {
      case 'get':
        return baseRequestConfig;
      default:
        baseRequestConfig.headers['Content-Type'] = 'application/json';
        return baseRequestConfig;
    }
  }
  private async responseFrom<ResponseBody = never>({
    request,
    onError,
  }: {
    request: Observable<AxiosResponse<ResponseBody, any>>;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, any>> {
    return await lastValueFrom(request.pipe(catchError(onError)));
  }

  get<ResponseBody>({
    path,
    idToken,
    onError,
  }: {
    path: string;
    idToken: string;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, unknown>> {
    return this.responseFrom({ request: this.httpService.get<ResponseBody>(path, this.getRequestConfig({ method: 'get', idToken })), onError });
  }

  post<RequestBody>({
    path,
    requestBody,
    idToken,
    onError,
  }: {
    path: string;
    requestBody: RequestBody;
    idToken: string;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse> {
    return this.responseFrom({ request: this.httpService.post<never>(path, requestBody, this.getRequestConfig({ method: 'post', idToken })), onError });
  }

  put<RequestBody, ResponseBody>({
    path,
    requestBody,
    idToken,
    onError,
  }: {
    path: string;
    requestBody: RequestBody;
    idToken: string;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, unknown>> {
    return this.responseFrom({
      request: this.httpService.put<never>(path, requestBody, this.getRequestConfig({ method: 'put', idToken })),
      onError,
    });
  }
}
