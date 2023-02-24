import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { catchError, lastValueFrom } from 'rxjs';

import AcbsConfig from '../../config/acbs.config';
import { AcbsAuthenticationFailedException } from './acbs-authentication-failed.exception';
import { IdpConnectResponse } from './dto/idp-connect-response.dto';

@Injectable()
export class AcbsAuthenticationService {
  private static readonly sessionsPath = '/sessions';
  private static readonly connectPath = '/idptoken/openid-connect';
  private static readonly sessionIdCookieName = 'JSESSIONID';
  private static readonly sessionIdCookieSeparator = ';';

  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'apiKey' | 'apiKeyHeaderName' | 'authentication'>,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger,
  ) {}

  async getIdToken(): Promise<string> {
    const sessionId = await this.createSession();
    return this.getIdTokenForSession(sessionId);
  }

  private async createSession(): Promise<string> {
    const createSessionResponse = await lastValueFrom(
      this.httpService
        .post<never>(
          AcbsAuthenticationService.sessionsPath,
          { loginName: this.config.authentication.loginName, password: this.config.authentication.password },
          {
            baseURL: this.config.authentication.baseUrl,
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
    const sessionIdCookie = response.headers['set-cookie'].find((cookie) => cookie.startsWith(AcbsAuthenticationService.sessionIdCookieName));

    if (!sessionIdCookie) {
      throw new AcbsAuthenticationFailedException('Session cookie was not returned by the IdP.');
    }

    return sessionIdCookie.includes(AcbsAuthenticationService.sessionIdCookieSeparator)
      ? sessionIdCookie.substring(0, sessionIdCookie.indexOf(AcbsAuthenticationService.sessionIdCookieSeparator))
      : sessionIdCookie;
  }

  private async getIdTokenForSession(sessionId: string): Promise<string> {
    const connectResponse = await lastValueFrom(
      this.httpService
        .get<IdpConnectResponse>(AcbsAuthenticationService.connectPath, {
          baseURL: this.config.authentication.baseUrl,
          params: { client_id: this.config.authentication.clientId },
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
