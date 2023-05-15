import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from '@ukef/helpers';
import { ApiKeyAuthGuard } from '@ukef/modules/auth/guard/api-key.guard';
import { SwaggerDocs } from '@ukef/swagger';
import compression from 'compression';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { InputCharacterValidationPipe } from './pipes/input-characters-validation';

export class App {
  private readonly configService: ConfigService;
  public readonly port: number;

  constructor(protected readonly app: INestApplication) {
    this.configService = app.get<ConfigService>(ConfigService);
    this.port = this.getConfig<number>('PORT') || 3001;

    const env: string = this.getConfig<string>('app.env');
    process.env.NODE_ENV = env;

    const globalPrefix: string = this.getConfig<string>('app.globalPrefix');
    const version: string = this.getConfig<string>('app.versioning.version');
    const versioningPrefix: string = this.getConfig<string>('app.versioning.prefix');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: version,
      prefix: versioningPrefix,
    });

    app.setGlobalPrefix(globalPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalPipes(new InputCharacterValidationPipe());

    // Swagger docs
    SwaggerDocs(app);

    app.useGlobalGuards(new ApiKeyAuthGuard());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
    app.use(
      compression({
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            // don't compress responses with this request header
            return false;
          }

          // fallback to standard filter function
          return compression.filter(req, res);
        },
      }),
    );
  }

  private getConfig<T = any>(key: string): T {
    return this.configService.get<T>(key);
  }

  listen(): Promise<void> {
    return this.app.listen(this.port);
  }
}
