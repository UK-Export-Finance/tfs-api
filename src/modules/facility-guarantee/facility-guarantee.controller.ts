import { Controller, Get, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { GetFacilityGuaranteesParamsDto } from './dto/get-facility-guarantees-params.dto';
import { GetFacilityGuaranteesResponse, GetFacilityGuaranteesResponseItem } from './dto/get-facility-guarantees-response.dto';
import { FacilityGuaranteeService } from './facility-guarantee.service';

@Controller()
export class FacilityGuaranteeController {
  constructor(private readonly facilityGuaranteeService: FacilityGuaranteeService) {}
  @Get('/facilities/:facilityIdentifier/guarantees')
  @ApiOperation({
    summary: 'Get all guarantees for a facility.',
  })
  @ApiOkResponse({
    description: 'The guarantees for the facility have been successfully retrieved.',
    type: GetFacilityGuaranteesResponseItem,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'The specified facilityIdentifier is not valid.',
  })
  @ApiNotFoundResponse({
    description:
      'The specified facility, or the guarantees for that facility, were not found. (Due to limitations of ACBS, a 404 response does not guarantee that the facility does not exist.)',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getGuaranteesForFacility(@Param() params: GetFacilityGuaranteesParamsDto): Promise<GetFacilityGuaranteesResponse> {
    const guaranteesForFacility = await this.facilityGuaranteeService.getGuaranteesForFacility(params.facilityIdentifier);
    return guaranteesForFacility.map((guarantee) => ({
      facilityIdentifier: guarantee.facilityIdentifier,
      portfolioIdentifier: guarantee.portfolioIdentifier,
      guaranteeCommencementDate: guarantee.guaranteeCommencementDate,
      effectiveDate: guarantee.effectiveDate,
      guarantorParty: guarantee.guarantorParty,
      limitKey: guarantee.limitKey,
      guaranteeExpiryDate: guarantee.guaranteeExpiryDate,
      maximumLiability: guarantee.maximumLiability,
      guaranteeTypeCode: guarantee.guaranteeTypeCode,
    }));
  }
}
