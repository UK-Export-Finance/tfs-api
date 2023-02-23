jest.mock('@nestjs/axios');
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { when } from 'jest-when';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsAuthenticationFailedException } from '@ukef/modules/acbs/acbs-authentication-failed.exception';

describe('AcbsAuthenticationService', () => {
    const baseUrl = 'the base url';
    const loginName = 'the login name';
    const password = 'the password';
    const apiKey = 'the api key';
    const apiKeyHeaderName = 'the-api-key-header-name';
    const sessionId = '1234';
    const sessionIdWithCookieName = `JSESSIONID=${sessionId}`;
    const clientId = 'the client id';
    const idToken = 'the id token';

    const expectedPostSessionsArguments: [string, object, object] = [
        '/sessions',
        {
            loginName,
            password, 
        },
        {
            baseURL: baseUrl, 
            headers: {
                'Content-Type': 'application/json',
                [apiKeyHeaderName]: apiKey,
            }
        },
    ];

    const cookie1 = 'Cookie1=Cookie1Value; Expires=Thu, 01-Jan-99 12:00:00 GMT; Path=Cookie1Path; Domain=Cookie1Domain; HttpOnly';
    const cookie2 = 'Cookie2=Cookie2Value; Expires=Fri, 02-Jan-99 12:00:00 GMT; Path=Cookie2Path; Domain=Cookie2Domain; HttpOnly';
    const sessionIdCookie = `${sessionIdWithCookieName}; Path=/some/path; Domain=some.domain.com; HttpOnly`;

    const expectedGetTokenArguments: [string, object] = [
        '/idptoken/openid-connect',
        { 
            baseURL: baseUrl, 
            params: { client_id: clientId },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                [apiKeyHeaderName]: apiKey,
                'Cookie': `${sessionIdWithCookieName}`,
            }
        }
    ];

    let httpService: HttpService;
    let service: AcbsAuthenticationService;

    beforeEach(() => {
        httpService = new HttpService();
        service = new AcbsAuthenticationService(
            { apiKey, apiKeyHeaderName, authentication: { baseUrl, loginName, password,  clientId }},
            httpService
        );
    });

    describe('successful authentication', () => {
        it('returns a token from the IdP if authentication is successful', async () => {
            mockSuccessfulCreateSessionRequest();
            mockSuccessfulGetTokenForSessionRequest();

            const token = await service.getIdToken();

            expect(token).toBe(idToken);
        });

        it('returns a token from the IdP if the IdP returns multiple session cookies', async () => {
            const cookiesWithTwoSessionCookies = [
                cookie1,
                sessionIdCookie,
                `JSESSIONID=${sessionId + 100}; Path=/some/path; Domain=some.domain.com; HttpOnly`,
                cookie2,
            ];
            mockSuccessfulCreateSessionRequestReturningCookies(cookiesWithTwoSessionCookies);
            mockSuccessfulGetTokenForSessionRequest();

            const token = await service.getIdToken();

            expect(token).toBe(idToken);
        });

        it('returns a token from the IdP if the session cookie does not include a semi-colon', async () => {
            const cookiesWithSessionCookieWithoutSemiColon = [
                cookie1,
                sessionIdWithCookieName,
                cookie2,
            ];
            mockSuccessfulCreateSessionRequestReturningCookies(cookiesWithSessionCookieWithoutSemiColon);
            mockSuccessfulGetTokenForSessionRequest();

            const token = await service.getIdToken();

            expect(token).toBe(idToken);
        });
    });

    describe('failed authentication', () => {
        it('throws an AcbsAuthenticationFailedException if there is an error when creating a session with the IdP', async () => {
            const sessionCreationError = new AxiosError();
            when(httpService.post)
                .calledWith(...expectedPostSessionsArguments)
                .mockReturnValueOnce(throwError(() => sessionCreationError));
            
            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('Failed to create a session with the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', sessionCreationError);
        });

        it('throws an AcbsAuthenticationFailedException if the IdP does not return a session id cookie', async () => {
            const cookiesWithoutSessionIdCookie = [cookie1, cookie2];
            mockSuccessfulCreateSessionRequestReturningCookies(cookiesWithoutSessionIdCookie);
            
            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('Session cookie was not returned by the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', undefined);    
        });

        it('throws an AcbsAuthenticationFailedException if there is an error when getting a token from the IdP', async () => {
            mockSuccessfulCreateSessionRequest();
            const getTokenError = new AxiosError();
            when (httpService.get)
                .calledWith(...expectedGetTokenArguments)
                .mockReturnValueOnce(throwError(() => getTokenError));

            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('Failed to get a token from the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', getTokenError);
        });

        it('throws an AcbsAuthenticationFailedException if the IdP does not return an id_token', async () => {
            mockSuccessfulCreateSessionRequest();
            mockSuccessfulGetTokenForSessionRequestReturning('');

            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('ID token was not returned by the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', undefined);
        });

        it('throws an AcbsAuthenticationFailedException if the IdP returns an empty id_token', async () => {
            mockSuccessfulCreateSessionRequest();
            mockSuccessfulGetTokenForSessionRequestReturning({ id_token: '' });

            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('ID token was not returned by the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', undefined);
        });

        it('throws an AcbsAuthenticationFailedException if the IdP returns an undefined id_token', async () => {
            mockSuccessfulCreateSessionRequest();
            mockSuccessfulGetTokenForSessionRequestReturning({ id_token: undefined });

            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('ID token was not returned by the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', undefined);
        });

        it('throws an AcbsAuthenticationFailedException if the IdP returns a null id_token', async () => {
            mockSuccessfulCreateSessionRequest();
            mockSuccessfulGetTokenForSessionRequestReturning({ id_token: null });

            const getTokenPromise = service.getIdToken();

            await expect(getTokenPromise)
                .rejects.toBeInstanceOf(AcbsAuthenticationFailedException);
            await expect(getTokenPromise)
                .rejects.toThrowError('ID token was not returned by the IdP.');
            await expect(getTokenPromise)
                .rejects.toHaveProperty('innerError', undefined);
        });
    });

    function mockSuccessfulCreateSessionRequest(): void {
        mockSuccessfulCreateSessionRequestReturningCookies([cookie1, sessionIdCookie, cookie2]);
    }

    function mockSuccessfulCreateSessionRequestReturningCookies(cookies: string[]): void {
        const headers = new AxiosHeaders();
        headers['set-cookie'] = cookies;

        when(httpService.post)
            .calledWith(...expectedPostSessionsArguments)
            .mockReturnValueOnce(of({
                data: '',
                status: 200,
                statusText: 'OK',
                config: undefined,
                headers: headers,
            }));
    }

    function mockSuccessfulGetTokenForSessionRequest(): void {
        mockSuccessfulGetTokenForSessionRequestReturning({ id_token: idToken });
    }

    function mockSuccessfulGetTokenForSessionRequestReturning(data: any): void {
        when(httpService.get)
            .calledWith(...expectedGetTokenArguments)
            .mockReturnValueOnce(of({
                data,
                status: 200,
                statusText: 'OK',
                config: undefined,
                headers: undefined,
            }));
    }
});