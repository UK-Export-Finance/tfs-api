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
    onError,
  }: {
    path: string;
    requestBody: RequestBody;
    headers?: RequestHeaders;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    const config: AxiosRequestConfig<RequestBody> = {};

    config.headers = {
      [process.env.APIM_MDM_KEY]: process.env.APIM_MDM_VALUE,
    };

    return this.responseFrom({ request: this.httpService.post<ResponseBody>(path, requestBody, config), onError });
  }

  get<QueryParams, ResponseBody>({
    path,
    queryParams,
    onError,
  }: {
    headers?: RequestHeaders;
    path: string;
    queryParams?: QueryParams;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody>> {
    const config: AxiosRequestConfig = {};

    config.headers = {
      [process.env.APIM_MDM_KEY]: process.env.APIM_MDM_VALUE,
    };

    if (queryParams) {
      config.params = queryParams;
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
