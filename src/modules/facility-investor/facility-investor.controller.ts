import { Body, Controller, Param, ParseArrayPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { CreateFacilityInvestorRequest, CreateFacilityInvestorRequestItem } from './dto/create-facility-investor-request.dto';
import { CreateFacilityInvestorResponse } from './dto/create-facility-investor-response.dto';
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
    example: '0000000001',
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
    @Param('facilityIdentifier') facilityIdentifier: string,
    @Body(new ParseArrayPipe({ items: CreateFacilityInvestorRequestItem })) newFacilityInvestorRequest: CreateFacilityInvestorRequest,
  ): Promise<CreateFacilityInvestorResponse> {
    const newFacilityInvestor = newFacilityInvestorRequest[0];
    const facilityInvestorToCreate: FacilityInvestorToCreate = {
      facilityIdentifier,
      effectiveDate: newFacilityInvestor.effectiveDate,
      guaranteeExpiryDate: newFacilityInvestor.guaranteeExpiryDate,
      currency: newFacilityInvestor.currency,
      maximumLiability: newFacilityInvestor.maximumLiability,
      lenderType: newFacilityInvestor.lenderType,
    };
    await this.facilityInvestorService.createInvestorForFacility(facilityIdentifier, facilityInvestorToCreate);
    return Promise.resolve(new CreateFacilityInvestorResponse(facilityIdentifier));
  }
}
