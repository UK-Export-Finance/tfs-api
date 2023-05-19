import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { AcbsBadRequestException } from '@ukef/modules/acbs/exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from '@ukef/modules/acbs/exception/acbs-resource-not-found.exception';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AcbsExceptionTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof AcbsResourceNotFoundException) {
            return new NotFoundException('Not found', { cause: err });
          }

          if (err instanceof AcbsBadRequestException) {
            return new BadRequestException('Bad request', { cause: err, description: err.errorBody });
          }

          return err;
        }),
      ),
    );
  }
}
