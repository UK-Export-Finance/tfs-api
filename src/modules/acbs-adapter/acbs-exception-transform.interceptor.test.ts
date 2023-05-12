import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AcbsBadRequestException } from '@ukef/modules/acbs/exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from '@ukef/modules/acbs/exception/acbs-resource-not-found.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { AcbsExceptionTransformInterceptor } from './acbs-exception-transform.interceptor';

describe('AcbsExceptionTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  it('converts thrown AcbsResourceNotFoundException to NotFoundException', async () => {
    const acbsResourceNotFoundException = new AcbsResourceNotFoundException('Test exception message');
    const interceptor = new AcbsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => acbsResourceNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(NotFoundException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Not found');
    await expect(interceptPromise).rejects.toHaveProperty('cause', acbsResourceNotFoundException);
  });

  it('converts thrown AcbsBadRequestException to BadRequestException', async () => {
    const innerError = new Error();
    const errorBody = valueGenerator.string();
    const acbsBadRequestException = new AcbsBadRequestException('Test exception message', innerError, errorBody);
    const interceptor = new AcbsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => acbsBadRequestException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Bad request');
    await expect(interceptPromise).rejects.toHaveProperty('cause', acbsBadRequestException);
  });

  it('does NOT convert thrown exceptions that are NOT AcbsResourceNotFoundException or AcbsBadRequestException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');
    const interceptor = new AcbsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
