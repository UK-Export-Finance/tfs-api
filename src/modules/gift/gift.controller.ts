import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import AppConfig from '@ukef/config/app.config';
import { Response } from 'express';

import { GetFacilityOperationParamsDto, GiftFacilityDto } from './dto';
import { GiftService } from './gift.service';

const { giftVersioning } = AppConfig();

@Controller({
  path: 'gift/facility',
  version: giftVersioning.version,
})

export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get(':facilityId')
  @ApiOperation({ summary: 'Get a GIFT facility by ID' })
  @ApiParam({
    name: 'facilityId',
    required: true,
    type: 'string',
    description: 'The facility ID',
    example: EXAMPLES.GIFT.FACILITY.FACILITY_ID,
  })
  @ApiOkResponse({
    description: 'The facility',
    type: GiftFacilityDto,
  })
  @ApiNotFoundResponse({
    description: 'The facility was not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
  })
  async get(@Param() { facilityId }: GetFacilityOperationParamsDto, @Res({ passthrough: true }) res: Response) {
    const { status, data } = await this.giftService.getFacility(facilityId);

    res.status(status).send(data);
  }
}
