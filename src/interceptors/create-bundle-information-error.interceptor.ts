import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class CreateBundleInformationErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        if (!data.facilityIdentifier) {
          if (data.warningErrors) {
            response.setHeader('processing-warning', data.warningErrors);
          }
          delete data.warningErrors;
        }
        return data;
      }),
    );
  }
}
