import { Injectable, Logger as NestLogger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const logger = new NestLogger();
    logger.warn('Request body: ', req.body);
    logger.warn('Response body: ', res);
    next();
  }
}
