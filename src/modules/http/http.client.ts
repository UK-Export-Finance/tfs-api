import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput } from 'rxjs';

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
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, RequestBody>> {
    const config: AxiosRequestConfig<RequestBody> = {};

    return this.responseFrom({ request: this.httpService.post<ResponseBody>(path, requestBody, config), onError });
  }

  get<QueryParams, ResponseBody>({
    path,
    queryParams,
    onError,
  }: {
    path: string;
    queryParams?: QueryParams;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody>> {
    const config: AxiosRequestConfig = {};

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
