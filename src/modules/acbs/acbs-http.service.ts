import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { AxiosResponse } from 'axios';
import { catchError, lastValueFrom, Observable, ObservableInput } from 'rxjs';

export class AcbsHttpService {
  constructor(private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>, private readonly httpService: HttpService) {}

  private getHeaders({ method, idToken }: { method: 'get' | 'post' | 'put'; idToken: string }) {
    const baseHeaders = { baseURL: this.config.baseUrl, headers: { Authorization: `Bearer ${idToken}`, ReturnException: process.env.ACBS_RETURN_EXCEPTION || false } };
    switch (method) {
      case 'get':
        return baseHeaders;
      default:
        baseHeaders.headers['Content-Type'] = 'application/json';
        return baseHeaders;
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
    return this.responseFrom({ request: this.httpService.get<ResponseBody>(path, this.getHeaders({ method: 'get', idToken })), onError });
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
    return this.responseFrom({ request: this.httpService.post<never>(path, requestBody, this.getHeaders({ method: 'post', idToken })), onError });
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
      request: this.httpService.put<never>(path, requestBody, this.getHeaders({ method: 'put', idToken })),
      onError,
    });
  }
}
