import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { AxiosResponse } from 'axios';
import { catchError, lastValueFrom, ObservableInput } from 'rxjs';

export class AcbsHttpService {
  constructor(private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>, private readonly httpService: HttpService) {}

  async get<ResponseBody>({
    path,
    idToken,
    onError,
  }: {
    path: string;
    idToken: string;
    onError: (error: Error) => ObservableInput<never>;
  }): Promise<AxiosResponse<ResponseBody, unknown>> {
    return await lastValueFrom(
      this.httpService
        .get<ResponseBody>(path, {
          baseURL: this.config.baseUrl,
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .pipe(catchError(onError)),
    );
  }

  async post<RequestBody>({
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
    // TODO: check if we need await here.
    return await lastValueFrom(
      this.httpService
        .post<never>(path, requestBody, {
          baseURL: this.config.baseUrl,
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        })
        .pipe(catchError(onError)),
    );
  }
}
