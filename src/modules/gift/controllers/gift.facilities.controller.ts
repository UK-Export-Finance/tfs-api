import { Response } from 'express';
import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppConfig } from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';

import { FacilityIdsOperationParamsDto, GiftFacilityResponseDto } from '@ukef/modules/gift/dto';
import { GiftFacilityService, GiftQueueService } from '@ukef/modules/gift/services';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.FACILITIES}`,
  version: giftVersioning.version,
})
export class GiftFacilitiesController {
  constructor(
    private readonly giftFacilityService: GiftFacilityService,
    private readonly giftQueueService: GiftQueueService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get multiple GIFT facilities by ID' })
  @ApiQuery({
    name: 'ids',
    required: true,
    type: 'string',
    description: 'Facility IDs, comma separated',
    example: EXAMPLES.GIFT.FACILITY_IDS_QUERY_PARAM,
  })
  @ApiAcceptedResponse({
    description: 'The facilities get request has been accepted and added to the queue',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
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
  async getManyQueue(@Query() { ids }: FacilityIdsOperationParamsDto, @Res({ passthrough: true }) res: Response) {
    await this.giftQueueService.enqueue({ messageType: 'FACILITY_GET_MANY', ids });

    res.status(HttpStatus.ACCEPTED);
  }

  @Get('without-queue')
  @ApiOperation({ summary: 'Without queue: Get multiple GIFT facilities by ID' })
  @ApiQuery({
    name: 'ids',
    required: true,
    type: 'string',
    description: 'Facility IDs, comma separated',
    example: EXAMPLES.GIFT.FACILITY_IDS_QUERY_PARAM,
  })
  @ApiOkResponse({
    description: 'The facilities',
    type: GiftFacilityResponseDto,
    isArray: true,
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
  getManyWithoutQueue(@Query() { ids }: FacilityIdsOperationParamsDto): Promise<GiftFacilityResponseDto[]> {
    return this.giftFacilityService.getMany(ids);
  }
}
