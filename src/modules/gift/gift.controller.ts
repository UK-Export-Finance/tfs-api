import { Body, Controller, Get, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Response } from 'express';

import { GetFacilityOperationParamsDto, GiftFacilityCreationDto, GiftFacilityDto } from './dto';
import { GiftService } from './gift.service';

@Controller('gift/facility')
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

  @Post()
  @ApiOperation({ summary: 'Create a GIFT facility' })
  @ApiBody({
    type: GiftFacilityCreationDto,
    required: true,
  })
  @ApiCreatedResponse({
    description: 'The created facility',
    type: GiftFacilityDto,
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
  async create(@Body(new ValidationPipe({ transform: true })) facilityData: GiftFacilityCreationDto, @Res({ passthrough: true }) res: Response) {
    const { status, data } = await this.giftService.createFacility(facilityData);

    res.status(status).send(data);
  }
}
