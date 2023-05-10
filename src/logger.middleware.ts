import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger as NestLogger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const logger = new NestLogger();
    logger.warn('Request body: ', req.body);
    logger.warn('Response body: ', res);
    next();
  }
}