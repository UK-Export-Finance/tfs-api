import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';

import { FacilityIdsOperationParamsDto, GiftFacilityResponseDto } from '../dto';
import { GiftFacilityService } from '../services';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.FACILITIES}`,
  version: giftVersioning.version,
})
export class GiftFacilitiesController {
  constructor(private readonly giftFacilityService: GiftFacilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get multiple GIFT facilities by ID' })
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
  getMany(@Query() { ids }: FacilityIdsOperationParamsDto): Promise<GiftFacilityResponseDto[]> {
    return this.giftFacilityService.getMany(ids);
  }
}
