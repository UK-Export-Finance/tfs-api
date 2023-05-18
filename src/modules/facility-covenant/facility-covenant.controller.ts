import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { NonEmptyRequestBodyValidationPipe } from '@ukef/helpers/non-empty-request-body-validation-pipe';

import { FacilityService } from '../facility/facility.service';
import { CreateFacilityCovenantRequestDto, CreateFacilityCovenantRequestItem } from './dto/create-facility-covenant-request.dto';
import { CreateOrUpdateFacilityCovenantsResponseDto } from './dto/create-or-update-covenants-response.dto';
import { FacilityCovenantsParamsDto } from './dto/facility-covenants-params.dto';
import { GetFacilityCovenantsResponseDto } from './dto/get-facility-covenants-response.dto';
import { UpdateFacilityCovenantsRequestDto } from './dto/update-facility-covenants-request.dto';
import { FacilityCovenantService } from './facility-covenant.service';

@Controller()
export class FacilityCovenantController {
  constructor(private readonly facilityCovenantService: FacilityCovenantService, private readonly facilityService: FacilityService) {}

  @Post('facilities/:facilityIdentifier/covenants')
  @ApiOperation({
    summary: 'Create a new covenant for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFacilityCovenantRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The covenant has been successfully created.',
    type: CreateOrUpdateFacilityCovenantsResponseDto,
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
  async createCovenantForFacility(
    @Param() params: FacilityCovenantsParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityCovenantRequestItem }) newCovenantRequest: CreateFacilityCovenantRequestDto,
  ): Promise<CreateFacilityCovenantResponseDto> {
    const facilityIdentifier = params.facilityIdentifier;
    const facility = await this.facilityService.getFacilityByIdentifier(facilityIdentifier);
    const newCovenant = newCovenantRequest[0];

    await this.facilityCovenantService.createCovenantForFacility(facilityIdentifier, facility.productTypeId, facility.obligorPartyIdentifier, newCovenant);
    return new CreateOrUpdateFacilityCovenantsResponseDto(facilityIdentifier);
  }

  @Get('/facilities/:facilityIdentifier/covenants')
  @ApiOperation({
    summary: 'Get all covenants for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiOkResponse({
    description:
      'The covenants for the facility have been retrieved. Due to limitations of ACBS, there is no 404 response; instead, an empty array means that either the facility does not exist or it has no covenants.',
    type: GetFacilityCovenantsResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'The specified facilityIdentifier is not valid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getCovenantsForFacility(@Param() params: FacilityCovenantsParamsDto): Promise<GetFacilityCovenantsResponseDto[]> {
    return await this.facilityCovenantService.getCovenantsForFacility(params.facilityIdentifier);
  }

  @Patch('/facilities/:facilityIdentifier/covenants')
  async updateCovenantsForFacility(
    @Param() params: FacilityCovenantsParamsDto,
    @Body(new NonEmptyRequestBodyValidationPipe()) updateCovenantRequest: UpdateFacilityCovenantsRequestDto,
  ): Promise<CreateOrUpdateFacilityCovenantsResponseDto> {
    const { facilityIdentifier } = params;
    await this.facilityCovenantService.updateCovenantsForFacility(facilityIdentifier, updateCovenantRequest);
    return new CreateOrUpdateFacilityCovenantsResponseDto(facilityIdentifier);
  }
}
