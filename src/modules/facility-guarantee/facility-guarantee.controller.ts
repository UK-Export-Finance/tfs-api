import { Body, Controller, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { NonEmptyObjectRequestBodyValidationPipe } from '@ukef/helpers/non-empty-object-request-body-validation-pipe';

import { CreateFacilityGuaranteeRequest, CreateFacilityGuaranteeRequestItem } from './dto/create-facility-guarantee-request.dto';
import { CreateOrUpdateFacilityGuaranteeResponse } from './dto/create-facility-guarantee-response.dto';
import { FacilityGuaranteesParamsDto } from './dto/facility-guarantees-params.dto';
import { GetFacilityGuaranteesResponse, GetFacilityGuaranteesResponseItem } from './dto/get-facility-guarantees-response.dto';
import { UpdateFacilityGuaranteesRequestDto } from './dto/update-facility-guarantees-request.dto';
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
  async getGuaranteesForFacility(@Param() params: FacilityGuaranteesParamsDto): Promise<GetFacilityGuaranteesResponse> {
    return await this.facilityGuaranteeService.getGuaranteesForFacility(params.facilityIdentifier);
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
    type: CreateOrUpdateFacilityGuaranteeResponse,
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
    @Param() { facilityIdentifier }: FacilityGuaranteesParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityGuaranteeRequestItem }) newGuaranteeRequest: CreateFacilityGuaranteeRequest,
  ): Promise<CreateOrUpdateFacilityGuaranteeResponse> {
    await this.facilityGuaranteeService.createGuaranteeForFacility(facilityIdentifier, newGuaranteeRequest[0]);
    return new CreateOrUpdateFacilityGuaranteeResponse(facilityIdentifier);
  }

  @Patch('facilities/:facilityIdentifier/guarantees')
  @ApiOperation({
    summary: 'Update all guarantees for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: UpdateFacilityGuaranteesRequestDto,
  })
  @ApiOkResponse({
    description: 'The guarantees for the facility have been updated.',
    type: CreateOrUpdateFacilityGuaranteeResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiNotFoundResponse({
    description:
      'The specified facility, or the guarantees for that facility, were not found. (Due to limitations of ACBS, a 404 response does not guarantee that the facility does not exist.)',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async updateGuaranteesForFacility(
    @Param() { facilityIdentifier }: FacilityGuaranteesParamsDto,
    @Body(new NonEmptyObjectRequestBodyValidationPipe()) updateGuaranteesRequest: UpdateFacilityGuaranteesRequestDto,
  ): Promise<CreateOrUpdateFacilityGuaranteeResponse> {
    await this.facilityGuaranteeService.updateGuaranteesForFacility(facilityIdentifier, updateGuaranteesRequest);
    return new CreateOrUpdateFacilityGuaranteeResponse(facilityIdentifier);
  }
}
