import { CallHandler, ExecutionContext, NestInterceptor, NotFoundException } from '@nestjs/common';
import { AcbsResourceNotFoundException } from '@ukef/modules/acbs/exception/acbs-resource-not-found.exception';
import { catchError, Observable, throwError } from 'rxjs';

export class AcbsExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => throwError(() => (err instanceof AcbsResourceNotFoundException ? new NotFoundException('Not found', { cause: err }) : err))));
  }
}
