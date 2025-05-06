import { Controller, Get, Res } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { Response } from 'express';

import { GiftCurrencyService } from './gift.currency.service';

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
    example: [CURRENCIES.EUR, CURRENCIES.GBP],
    isArray: true,
    type: String,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
  })
  async get(@Res() res: Response) {
    const { status, data } = await this.giftCurrencyService.getSupportedCurrencies();

    res.status(status).send(data);
  }
}
