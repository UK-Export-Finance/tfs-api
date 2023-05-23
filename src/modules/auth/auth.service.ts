import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AppConfig from '@ukef/config/app.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AppConfig>, 'apiKey'>,
  ) {}

  validateApiKey(key: string): boolean {
    const { apiKey } = this.config;
    return apiKey === key;
  }
}
