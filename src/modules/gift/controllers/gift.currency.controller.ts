import { Controller, Get, Res } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { Response } from 'express';

import { GiftCurrencyService } from '../services';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.CURRENCY}`,
  version: giftVersioning.version,
})
export class GiftCurrencyController {
  constructor(private readonly giftCurrencyService: GiftCurrencyService) {}

  @Get(PATH.SUPPORTED)
  @ApiOperation({ summary: 'Get all supported GIFT currencies' })
  @ApiOkResponse({
    description: 'The supported currencies',
    isArray: true,
    type: String,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
  })
  /**
   * NOTE: Because we need to return custom responses (instead of NestJS doing this for us), we lose some response handling that NestJS provides by default.
   * Therefore, we use passthrough: true to ensure that NestJS provides some additional response handling.
   * Further information: https://docs.nestjs.com/controllers#library-specific-approach
   */
  async get(@Res({ passthrough: true }) res: Response) {
    const { status, data } = await this.giftCurrencyService.getSupportedCurrencies();

    res.status(status).send(data);
  }
}
