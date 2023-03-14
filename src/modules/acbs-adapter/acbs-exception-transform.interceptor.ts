import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { AcbsResourceNotFoundException } from '@ukef/module/acbs/exception/acbs-resource-not-found.exception';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AcbsExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => throwError(() => (err instanceof AcbsResourceNotFoundException ? new NotFoundException('Not found', { cause: err }) : err))));
  }
}
