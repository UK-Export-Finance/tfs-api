import { Body, Controller, Get, Param, ParseArrayPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';

import { CreateFacilityGuaranteeRequest, CreateFacilityGuaranteeRequestItem } from './dto/create-facility-guarantee-request.dto';
import { CreateFacilityGuaranteeResponse } from './dto/create-facility-guarantee-response.dto';
import { GetFacilityGuaranteesParamsDto } from './dto/get-facility-guarantees-params.dto';
import { GetFacilityGuaranteesResponse, GetFacilityGuaranteesResponseItem } from './dto/get-facility-guarantees-response.dto';
import { FacilityGuaranteeService } from './facility-guarantee.service';
import { FacilityGuaranteeToCreate } from './facility-guarantee-to-create.interface';

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

  @Post('facilities/:facilityIdentifier/guarantees')
  @ApiOperation({
    summary: 'Create a new guarantee for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFacilityGuaranteeRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The guarantee has been successfully created.',
    type: CreateFacilityGuaranteeResponse,
  })
  @ApiNotFoundResponse({
    description: 'The facility was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async createGuaranteeForFacility(
    @Param('facilityIdentifier') facilityIdentifier: UkefId,
    @Body(new ParseArrayPipe({ items: CreateFacilityGuaranteeRequestItem, whitelist: true })) newGuaranteeRequest: CreateFacilityGuaranteeRequest,
  ): Promise<CreateFacilityGuaranteeResponse> {
    const newGuarantee = newGuaranteeRequest[0];
    const guaranteeToCreate: FacilityGuaranteeToCreate = {
      facilityIdentifier: newGuarantee.facilityIdentifier,
      effectiveDate: newGuarantee.effectiveDate,
      limitKey: newGuarantee.limitKey,
      guaranteeExpiryDate: newGuarantee.guaranteeExpiryDate,
      maximumLiability: newGuarantee.maximumLiability,
      guarantorParty: newGuarantee.guarantorParty,
      guaranteeTypeCode: newGuarantee.guaranteeTypeCode,
    };
    await this.facilityGuaranteeService.createGuaranteeForFacility(facilityIdentifier, guaranteeToCreate);
    return new CreateFacilityGuaranteeResponse(facilityIdentifier);
  }
}
