import { Body, Controller, Get, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Response } from 'express';

import { GetFacilityOperationParamsDto, GiftFacilityCreationRequestDto, GiftFacilityCreationResponseDto, GiftFacilityOverviewRequestDto } from './dto';
import { GiftFacilityService } from './gift.facility.service';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.FACILITY}`,
  version: giftVersioning.version,
})
export class GiftFacilityController {
  constructor(private readonly giftFacilityService: GiftFacilityService) {}

  @Get(':facilityId')
  @ApiOperation({ summary: 'Get a GIFT facility by ID' })
  @ApiParam({
    name: 'facilityId',
    required: true,
    type: 'string',
    description: 'The facility ID',
    example: EXAMPLES.GIFT.FACILITY_ID,
  })
  @ApiOkResponse({
    description: 'The facility',
    type: GiftFacilityOverviewRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'The facility was not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
  })
  /**
   * NOTE: Because we need to return custom responses (instead of NestJS doing this for us), we lose some response handling that NestJS provides by default.
   * Therefore, we use passthrough: true to ensure that NestJS provides some additional response handling.
   * Further information: https://docs.nestjs.com/controllers#library-specific-approach
   */
  async get(@Param() { facilityId }: GetFacilityOperationParamsDto, @Res({ passthrough: true }) res: Response) {
    const { status, data } = await this.giftFacilityService.get(facilityId);

    res.status(status).send(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create a GIFT facility' })
  @ApiBody({
    type: GiftFacilityCreationRequestDto,
    required: true,
  })
  @ApiCreatedResponse({
    description: 'The created facility',
    type: GiftFacilityCreationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
  })
  /**
   * NOTE: Because we need to return custom responses (instead of NestJS doing this for us), we lose some response handling that NestJS provides by default.
   * Therefore, we use passthrough: true to ensure that NestJS provides some additional response handling.
   * Further information: https://docs.nestjs.com/controllers#library-specific-approach
   */
  async post(@Body(new ValidationPipe({ transform: true })) facilityData: GiftFacilityCreationRequestDto, @Res({ passthrough: true }) res: Response) {
    const {
      overview: { facilityId },
    } = facilityData;

    const { status, data } = await this.giftFacilityService.create(facilityData, facilityId);

    res.status(status).send(data);
  }
}
