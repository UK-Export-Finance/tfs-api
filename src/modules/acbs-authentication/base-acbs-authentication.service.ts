import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsAuthenticationConfig from '@ukef/config/acbs-authentication.config';
import { ACBS } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { catchError, lastValueFrom } from 'rxjs';

import { AcbsAuthenticationService } from './acbs-authentication.service';
import { IdpConnectResponse } from './dto/idp-connect-response.dto';
import { AcbsAuthenticationFailedException } from './exception/acbs-authentication-failed.exception';

type RequiredConfigKeys = 'apiKey' | 'apiKeyHeaderName' | 'baseUrl' | 'clientId' | 'loginName' | 'password';

@Injectable()
export class BaseAcbsAuthenticationService extends AcbsAuthenticationService {
  private static readonly sessionsPath = '/sessions';
  private static readonly connectPath = '/idptoken/openid-connect';
  private static readonly sessionIdCookieSeparator = ';';

  constructor(
    @Inject(AcbsAuthenticationConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsAuthenticationConfig>, RequiredConfigKeys>,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  async getIdToken(): Promise<string> {
    const sessionId = await this.createSession();
    return this.getIdTokenForSession(sessionId);
  }

  private async createSession(): Promise<string> {
    const createSessionResponse = await lastValueFrom(
      this.httpService
        .post<never>(
          BaseAcbsAuthenticationService.sessionsPath,
          { loginName: this.config.loginName, password: this.config.password },
          {
            baseURL: this.config.baseUrl,
            headers: {
              'Content-Type': 'application/json',
              [this.config.apiKeyHeaderName]: this.config.apiKey,
            },
          },
        )
        .pipe(
          catchError((error: Error) => {
            this.logger.error(error);
            throw new AcbsAuthenticationFailedException('Failed to create a session with the IdP.', error);
          }),
        ),
    );
    return this.extractSessionIdFromCreateSessionResponse(createSessionResponse);
  }

  private extractSessionIdFromCreateSessionResponse(response: AxiosResponse): string {
    const sessionIdCookie = response.headers['set-cookie'].find((cookie) => cookie.startsWith(ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME));

    if (!sessionIdCookie) {
      throw new AcbsAuthenticationFailedException('Session cookie was not returned by the IdP.');
    }

    return sessionIdCookie.includes(BaseAcbsAuthenticationService.sessionIdCookieSeparator)
      ? sessionIdCookie.substring(0, sessionIdCookie.indexOf(BaseAcbsAuthenticationService.sessionIdCookieSeparator))
      : sessionIdCookie;
  }

  private async getIdTokenForSession(sessionId: string): Promise<string> {
    const connectResponse = await lastValueFrom(
      this.httpService
        .get<IdpConnectResponse>(BaseAcbsAuthenticationService.connectPath, {
          baseURL: this.config.baseUrl,
          params: { client_id: this.config.clientId },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [this.config.apiKeyHeaderName]: this.config.apiKey,
            Cookie: sessionId,
          },
        })
        .pipe(
          catchError((error: Error) => {
            this.logger.error(error);
            throw new AcbsAuthenticationFailedException('Failed to get a token from the IdP.', error);
          }),
        ),
    );

    return this.extractIdTokenFromConnectResponse(connectResponse);
  }

  private extractIdTokenFromConnectResponse(response: AxiosResponse<IdpConnectResponse>): string {
    const { id_token: idToken } = response.data || {};

    if (!idToken || typeof idToken !== 'string') {
      throw new AcbsAuthenticationFailedException('ID token was not returned by the IdP.');
    }
    return idToken;
  }
}
