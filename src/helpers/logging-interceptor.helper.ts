import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestBody = context.switchToHttp().getRequest().body;
    this.logger.debug(`Request body: ${JSON.stringify(requestBody)}`);

    return next.handle().pipe(
      tap((responseBody) => {
        this.logger.debug(`Response body: ${JSON.stringify(responseBody)}`);
      }),
    );
  }
}
