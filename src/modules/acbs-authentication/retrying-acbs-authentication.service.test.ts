import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';

import { AcbsAuthenticationService } from './acbs-authentication.service';
import { RetryingAcbsAuthenticationService } from './retrying-acbs-authentication.service';

describe('RetryingAcbsAuthenticationService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idTokenFromInnerService = valueGenerator.string();
  const retryDelayInMilliseconds = 100;

  const getLogMessageForRetryNumber = (retryNumber: number) =>
    `Failed to get an ACBS authentication id token - retrying the request now (retry attempt ${retryNumber}).`;

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsAuthenticationServiceGetIdToken: jest.Mock;

  let logger: PinoLogger;
  let loggerWarn: jest.Mock;

  let service: RetryingAcbsAuthenticationService;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;

    logger = new PinoLogger({});
    loggerWarn = jest.fn();
    logger.warn = loggerWarn;
  });

  describe('getIdToken', () => {
    describe('when the max number of retries is 0', () => {
      const maxNumberOfRetries = 0;

      beforeEach(() => {
        service = new RetryingAcbsAuthenticationService({ maxNumberOfRetries, retryDelayInMilliseconds }, acbsAuthenticationService, logger);
      });

      withTestsThatItReturnsTheIdTokenIfItErrorsXTimesBeforeSuccess([
        {
          numberOfErrorsBeforeSuccess: 0,
        },
      ]);

      withTestThatItErrorsWithTheLastErrorOfTheAcbsAuthenticationServiceIfItErrors({ times: 1 });
    });

    describe('when the max number of retries is 1', () => {
      const maxNumberOfRetries = 1;

      beforeEach(() => {
        service = new RetryingAcbsAuthenticationService({ maxNumberOfRetries, retryDelayInMilliseconds }, acbsAuthenticationService, logger);
      });

      withTestsThatItReturnsTheIdTokenIfItErrorsXTimesBeforeSuccess([
        {
          numberOfErrorsBeforeSuccess: 0,
        },
        {
          numberOfErrorsBeforeSuccess: 1,
        },
      ]);

      withTestThatItErrorsWithTheLastErrorOfTheAcbsAuthenticationServiceIfItErrors({ times: 2 });

      it('logs that it is going to retry to get the id token at WARN level if it errors on the first attempt', async () => {
        const { lastError: firstAttemptError } = givenAcbsAuthenticationServiceGetIdTokenErrors({ times: 1 });
        when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idTokenFromInnerService);

        await service.getIdToken();

        expect(loggerWarn).toHaveBeenCalledWith(firstAttemptError, getLogMessageForRetryNumber(1));
      });
    });

    describe('when the max number of retries is 5', () => {
      const maxNumberOfRetries = 5;

      beforeEach(() => {
        service = new RetryingAcbsAuthenticationService({ maxNumberOfRetries, retryDelayInMilliseconds }, acbsAuthenticationService, logger);
      });

      withTestsThatItReturnsTheIdTokenIfItErrorsXTimesBeforeSuccess([
        {
          numberOfErrorsBeforeSuccess: 0,
        },
        {
          numberOfErrorsBeforeSuccess: 1,
        },
        {
          numberOfErrorsBeforeSuccess: 2,
        },
        {
          numberOfErrorsBeforeSuccess: 3,
        },
        {
          numberOfErrorsBeforeSuccess: 4,
        },
        {
          numberOfErrorsBeforeSuccess: 5,
        },
      ]);

      withTestThatItErrorsWithTheLastErrorOfTheAcbsAuthenticationServiceIfItErrors({ times: 6 });

      it('logs that it is going to retry to get the id token at WARN level 5 times if it errors six times', async () => {
        const { allErrors } = givenAcbsAuthenticationServiceGetIdTokenErrors({ times: 6 });
        const [originalError, retryOneError, retryTwoError, retryThreeError, retryFourError] = allErrors;

        await service.getIdToken().catch(() => {
          /* ignored */
        });

        expect(loggerWarn).toHaveBeenCalledWith(originalError, getLogMessageForRetryNumber(1));
        expect(loggerWarn).toHaveBeenCalledWith(retryOneError, getLogMessageForRetryNumber(2));
        expect(loggerWarn).toHaveBeenCalledWith(retryTwoError, getLogMessageForRetryNumber(3));
        expect(loggerWarn).toHaveBeenCalledWith(retryThreeError, getLogMessageForRetryNumber(4));
        expect(loggerWarn).toHaveBeenCalledWith(retryFourError, getLogMessageForRetryNumber(5));
      });
    });
  });

  const givenAcbsAuthenticationServiceGetIdTokenErrors = ({ times }: { times: number } = { times: 1 }): { lastError: Error; allErrors: Error[] } => {
    const arrayOfLengthTimes = new Array(times).fill(0);
    const errors = arrayOfLengthTimes.map((_value, index) => new Error(`Error number ${index + 1}`));
    errors.forEach((error) => {
      when(acbsAuthenticationServiceGetIdToken).calledWith().mockRejectedValue(error);
    });
    return { allErrors: errors, lastError: errors[times - 1] };
  };

  function withTestsThatItReturnsTheIdTokenIfItErrorsXTimesBeforeSuccess(cases: { numberOfErrorsBeforeSuccess: number }[]): void {
    it.each(cases)(
      'returns the id token from the AcbsAuthenticationService if it errors $numberOfErrorsBeforeSuccess times and then succeeds',
      async ({ numberOfErrorsBeforeSuccess }) => {
        givenAcbsAuthenticationServiceGetIdTokenErrors({ times: numberOfErrorsBeforeSuccess });
        when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idTokenFromInnerService);

        const idToken = await service.getIdToken();

        expect(idToken).toBe(idTokenFromInnerService);
      },
    );
  }

  function withTestThatItErrorsWithTheLastErrorOfTheAcbsAuthenticationServiceIfItErrors({ times }: { times: number }) {
    it(`errors with the last error of the AcbsAuthenticationService if it errors ${times} time(s)`, async () => {
      const { lastError } = givenAcbsAuthenticationServiceGetIdTokenErrors({ times });

      const getIdTokenPromise = service.getIdToken();

      await expect(getIdTokenPromise).rejects.toBe(lastError);
    });
  }
});
