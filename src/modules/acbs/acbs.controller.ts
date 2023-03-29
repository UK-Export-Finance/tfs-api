import { Controller, Get } from '@nestjs/common';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

// TODO API-70: Delete this controller
@Controller('test')
export class TestController {
  constructor(private readonly acbsAuthenticationService: AcbsAuthenticationService) {}

  @Get()
  async getToken(): Promise<{ token: string }> {
    const token = await this.acbsAuthenticationService.getIdToken();
    return { token };
  }
}
