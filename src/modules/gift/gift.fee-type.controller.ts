import { Controller, Get, Res } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Response } from 'express';

import { GiftFeeTypeService } from './gift.fee-type.service';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.FEE_TYPE}`,
  version: giftVersioning.version,
})
export class GiftFeeTypeController {
  constructor(private readonly giftFeeTypeService: GiftFeeTypeService) {}

  @Get(PATH.SUPPORTED)
  @ApiOperation({ summary: 'Get all supported GIFT fee types' })
  @ApiOkResponse({
    description: 'The supported fee types',
    example: EXAMPLES.GIFT.FEE_TYPES_RESPONSE_DATA,
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
    const { status, data } = await this.giftFeeTypeService.getSupportedFeeTypes();

    res.status(status).send(data);
  }
}
