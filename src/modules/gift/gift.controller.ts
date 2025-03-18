import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Response } from 'express';

import { GiftFacilityDto } from './dto';
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
    description: 'The facility ID.',
    example: EXAMPLES.GIFT.FACILITY_ID,
  })
  @ApiOkResponse({
    description: '',
    type: GiftFacilityDto,
  })
  async get(@Param('facilityId') facilityId: string, @Res({ passthrough: true }) res: Response): Promise<GiftFacilityDto | Error> {
    const { status, data } = await this.giftService.getFacility(facilityId);

    res.status(status).send(data);

    return data;
  }
}
