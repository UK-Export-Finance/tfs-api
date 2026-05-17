import { Controller, Get, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiUnauthorizedResponse } from '@nestjs/swagger';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { FacilityIdsOperationParamsDto, GiftFacilityOverviewRequestDto } from '../dto';
import { GiftFacilityService } from '../services';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.FACILITIES}`,
  version: giftVersioning.version,
})
export class GiftFacilitiesController {
  constructor(private readonly giftFacilityService: GiftFacilityService) {}

  @Get(':ids')
  @ApiOperation({ summary: 'Get multiple GIFT facilities by ID' })
  @ApiParam({
    name: 'ids',
    required: true,
    type: 'string',
    description: 'Facility IDs, comma separated',
    example: EXAMPLES.GIFT.FACILITY_IDS_QUERY_PARAM,
  })
  @ApiOkResponse({
    description: 'The facilities',
    type: GiftFacilityOverviewRequestDto,
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
  getMany(@Param() { ids }: FacilityIdsOperationParamsDto): Promise<AxiosResponse[]> {
    return this.giftFacilityService.getMany(ids);
  }
}
