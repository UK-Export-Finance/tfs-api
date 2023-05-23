import { BadRequestException, Body, Controller, Get, Param, ParseArrayPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FacilityService } from '@ukef/modules/facility/facility.service';

import { CreateFacilityFixedFeeRequest, CreateFacilityFixedFeeRequestItem } from './dto/create-facility-fixed-fee-request.dto';
import { CreateFacilityFixedFeeResponse } from './dto/create-facility-fixed-fee-response.dto';
import { FacilityFixedFeeParamsDto } from './dto/facility-fixed-fee-params.dto';
import { GetFacilityFixedFeeResponse, GetFacilityFixedFeeResponseItem } from './dto/get-facility-fixed-fee-response.dto';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

@Controller()
export class FacilityFixedFeeController {
  constructor(private readonly facilityFixedFeeService: FacilityFixedFeeService, private readonly facilityService: FacilityService) {}
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
  async getFixedFeesForFacility(@Param() params: FacilityFixedFeeParamsDto): Promise<GetFacilityFixedFeeResponse> {
    return await this.facilityFixedFeeService.getFixedFeesForFacility(params.facilityIdentifier);
  }

  @Post('facilities/:facilityIdentifier/fixed-fees')
  @ApiOperation({
    summary: 'Create a new fixed fee for a facility.',
  })
  @ApiBody({
    type: CreateFacilityFixedFeeRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The fixed fee has been successfully created.',
    type: CreateFacilityFixedFeeResponse,
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
  async createFixedFeeForFacility(
    @Param() params: FacilityFixedFeeParamsDto,
    @Body(new ParseArrayPipe({ items: CreateFacilityFixedFeeRequestItem }))
    newCreateFacilityFixedFeeRequest: CreateFacilityFixedFeeRequest,
  ): Promise<CreateFacilityFixedFeeResponse> {
    const facility = await this.facilityService.getFacilityByIdentifier(params.facilityIdentifier);

    if (facility.facilityStageCode !== '07') {
      throw new BadRequestException('Bad Request', 'Facility needs to be issued before Fee is created');
    }

    if (facility.facilityOverallStatus !== 'A') {
      throw new BadRequestException('Bad Request', 'Facility needs to be activated before Fee is created');
    }

    const [newCreateFacilityFixedFee] = newCreateFacilityFixedFeeRequest;

    await this.facilityFixedFeeService.createFixedFeeForFacility(
      params.facilityIdentifier,
      facility.obligorPartyIdentifier,
      facility.productTypeId,
      newCreateFacilityFixedFee,
    );

    return new CreateFacilityFixedFeeResponse(params.facilityIdentifier);
  }
}
