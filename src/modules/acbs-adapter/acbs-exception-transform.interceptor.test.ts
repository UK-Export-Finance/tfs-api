import { NotFoundException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';

import { AcbsResourceNotFoundException } from '../acbs/exception/acbs-resource-not-found.exception';
import { AcbsExceptionTransformInterceptor } from './acbs-exception-transform.interceptor';

describe('AcbsExceptionTransformInterceptor', () => {
  it('converts thrown AcbsResourceNotFoundException to NotFoundException', async () => {
    const acbsResourceNotFoundException = new AcbsResourceNotFoundException('Test exception');
    const interceptor = new AcbsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => acbsResourceNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(NotFoundException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Not found');
    await expect(interceptPromise).rejects.toHaveProperty('cause', acbsResourceNotFoundException);
  });

  it('does NOT convert thrown exceptions that are NOT AcbsResourceNotFoundException', async () => {
    const notAcbsResourceNotFoundException = new Error('Test exception');
    const interceptor = new AcbsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => notAcbsResourceNotFoundException) }));

    await expect(interceptPromise).rejects.not.toBeInstanceOf(NotFoundException);
    await expect(interceptPromise).rejects.toThrow(notAcbsResourceNotFoundException);
  });
});
