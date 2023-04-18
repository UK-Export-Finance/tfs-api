import { Controller, Get, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { GetFacilityCovenantsParamsDto } from './dto/get-facility-covenants-params.dto';
import { GetFacilityCovenantsResponseDto } from './dto/get-facility-covenants-response.dto';
import { FacilityCovenantService } from './facility-covenant.service';

@Controller()
export class FacilityCovenantController {
  constructor(private readonly facilityCovenantService: FacilityCovenantService) {}
  @Get('/facilities/:facilityIdentifier/covenants')
  @ApiOperation({
    summary: 'Get all covenants for a facility.',
  })
  @ApiOkResponse({
    description: 'The covenants for the facility have been retrieved. Due to limitations of ACBS, there is no 404 response; instead, an empty array means that either the facility does not exist or it has no covenants. ',
    type: GetFacilityCovenantsResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'The specified facilityIdentifier is not valid.',
  })
  @ApiNotFoundResponse({
    description:
      'The specified facility, or the covenants for that facility, were not found. ',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getCovenantsForFacility(@Param() params: GetFacilityCovenantsParamsDto): Promise<GetFacilityCovenantsResponseDto[]> {
    const covenantsForFacility = await this.facilityCovenantService.getCovenantsForFacility(params.facilityIdentifier);
    return covenantsForFacility;
  }
}
