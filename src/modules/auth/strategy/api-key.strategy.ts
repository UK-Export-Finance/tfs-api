import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AUTH } from '@ukef/constants';

import { AuthService } from '@ukef/modules/auth/auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, AUTH.STRATEGY) {
  constructor(private readonly authService: AuthService) {
    super({ header: AUTH.STRATEGY, prefix: '' }, true, (apiKey: string, done: (arg0: UnauthorizedException | null, arg1: boolean | null) => void) => {
      const hasValidKey = this.authService.validateApiKey(apiKey);

      if (hasValidKey) {
        return void done(null, true);
      }

      return void done(new UnauthorizedException(), null);
    });
  }
}
