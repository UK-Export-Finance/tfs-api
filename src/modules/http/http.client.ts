import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
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
    headers: RequestHeaders;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    return this.responseFrom({ request: this.httpService.post<ResponseBody>(path, requestBody, { headers }), onError });
  }

  get<QueryParams, ResponseBody>({
    path,
    queryParams,
    headers,
    onError,
  }: {
    path: string;
    queryParams: QueryParams;
    headers: RequestHeaders;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody>> {
    return this.responseFrom({ request: this.httpService.get<ResponseBody>(path, { headers, params: queryParams }), onError });
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
