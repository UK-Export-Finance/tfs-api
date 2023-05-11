import { Controller, Get, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { GetFacilityFixedFeeParamsDto } from './dto/get-facility-fixed-fee-params.dto';
import { GetFacilityFixedFeeResponse, GetFacilityFixedFeeResponseItem } from './dto/get-facility-fixed-fee-response.dto';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

@Controller()
export class FacilityFixedFeeController {
  constructor(private readonly facilityFixedFeeService: FacilityFixedFeeService) {}
  @Get('/facilities/:facilityIdentifier/fixed-fees')
  @ApiOperation({
    summary: 'Get all fixed fees for a facility.',
  })
  @ApiOkResponse({
    description: 'The fixed fees for the facility have been successfully retrieved.',
    type: GetFacilityFixedFeeResponseItem,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'The specified facilityIdentifier is not valid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getFixedFeesForFacility(@Param() params: GetFacilityFixedFeeParamsDto): Promise<GetFacilityFixedFeeResponse> {
    return await this.facilityFixedFeeService.getFixedFeesForFacility(params.facilityIdentifier);
  }
}
