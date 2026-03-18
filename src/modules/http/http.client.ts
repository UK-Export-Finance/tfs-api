import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput } from 'rxjs';

import { RequestHeaders } from './type/headers.type';

// TODO APIM-336: commonise with AcbsHttpService
export class HttpClient {
  constructor(private readonly httpService: HttpService) {}

  post<RequestBody, ResponseBody>({
    path,
    requestBody,
    headers,
    onError,
  }: {
    path: string;
    requestBody: RequestBody;
    headers?: RequestHeaders;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    const config: AxiosRequestConfig<RequestBody> = {};

    if (headers) {
      config.headers = headers;
    }

    return this.responseFrom({ request: this.httpService.post<ResponseBody>(path, requestBody, config), onError });
  }

  get<QueryParams, ResponseBody>({
    path,
    queryParams,
    headers,
    onError,
  }: {
    path: string;
    queryParams: QueryParams;
    headers?: RequestHeaders;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody>> {
    const config: AxiosRequestConfig = { params: queryParams };

    if (headers) {
      config.headers = headers;
    }

    return this.responseFrom({ request: this.httpService.get<ResponseBody>(path, config), onError });
  }

  private async responseFrom<RequestBody, ResponseBody>({
    request,
    onError,
  }: {
    request: Observable<AxiosResponse<ResponseBody, RequestBody>>;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    return await lastValueFrom(request.pipe(catchError((error) => onError(error))));
  }
}
