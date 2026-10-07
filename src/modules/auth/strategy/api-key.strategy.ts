import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AUTH } from '@ukef/constants';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, AUTH.STRATEGY) {
  constructor(private readonly authService: AuthService) {
    super({ header: AUTH.STRATEGY, prefix: '' }, false);
  }

  validate(apiKey: string): boolean {
    const hasValidKey = this.authService.validateApiKey(apiKey);

    if (!hasValidKey) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
