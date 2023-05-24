import { Controller, Get, Param, Post } from '@nestjs/common';
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

import { CreateFacilityInvestorParams } from './dto/create-facility-investor-params.dto';
import { CreateFacilityInvestorRequest, CreateFacilityInvestorRequestItem } from './dto/create-facility-investor-request.dto';
import { CreateFacilityInvestorResponse } from './dto/create-facility-investor-response.dto';
import { GetFacilityInvestorsParamsDto } from './dto/get-facility-investors-params.dto';
import { GetFacilityInvestorResponseItem, GetFacilityInvestorsResponse } from './dto/get-facility-investors-response.dto';
import { FacilityInvestorService } from './facility-investor.service';
import { FacilityInvestorToCreate } from './facility-investor-to-create.interface';

@Controller()
export class FacilityInvestorController {
  constructor(private readonly facilityInvestorService: FacilityInvestorService) {}

  @Post('facilities/:facilityIdentifier/investors')
  @ApiOperation({
    summary: 'Create a new investor for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFacilityInvestorRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The investor has been successfully created.',
    type: CreateFacilityInvestorResponse,
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
  async createInvestorForFacility(
    @Param() params: CreateFacilityInvestorParams,
    @ValidatedArrayBody({ items: CreateFacilityInvestorRequestItem }) newFacilityInvestorRequest: CreateFacilityInvestorRequest,
  ): Promise<CreateFacilityInvestorResponse> {
    const [newFacilityInvestor] = newFacilityInvestorRequest;
    const facilityInvestorToCreate: FacilityInvestorToCreate = {
      effectiveDate: newFacilityInvestor.effectiveDate,
      guaranteeExpiryDate: newFacilityInvestor.guaranteeExpiryDate,
      currency: newFacilityInvestor.currency,
      maximumLiability: newFacilityInvestor.maximumLiability,
      lenderType: newFacilityInvestor.lenderType,
    };
    const { facilityIdentifier } = params;
    await this.facilityInvestorService.createInvestorForFacility(facilityIdentifier, facilityInvestorToCreate);
    return Promise.resolve(new CreateFacilityInvestorResponse(facilityIdentifier));
  }

  @Get('facilities/:facilityIdentifier/investors')
  @ApiOperation({
    summary: 'Get all investors of the facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiOkResponse({
    description: 'The facility investors have been successfully retrieved.',
    type: GetFacilityInvestorResponseItem,
    isArray: true,
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
  getInvestorsForFacility(@Param() params: GetFacilityInvestorsParamsDto): Promise<GetFacilityInvestorsResponse> {
    return this.facilityInvestorService.getInvestorsForFacility(params.facilityIdentifier);
  }
}
