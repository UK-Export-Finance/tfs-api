import { Body, Controller, Get, HttpStatus, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import {
  ApiAcceptedResponse,
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

import {
  CreateGiftFacilityAmendmentRequestDto,
  CreateGiftFacilityAmendmentResponseDto,
  FacilityIdOperationParamsDto,
  GiftFacilityCreationRequestDto,
  GiftFacilityCreationResponseDto,
  GiftFacilityOverviewRequestDto,
} from '../dto';
import { GiftFacilityAmendmentService, GiftFacilityService, GiftQueueService } from '../services';

const { PATH } = GIFT;

const { giftVersioning } = AppConfig();

@Controller({
  path: `gift${PATH.FACILITY}`,
  version: giftVersioning.version,
})
export class GiftFacilityController {
  constructor(
    private readonly giftFacilityService: GiftFacilityService,
    private readonly giftFacilityAmendmentService: GiftFacilityAmendmentService,
    private readonly giftQueueService: GiftQueueService,
  ) {}

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
  async get(@Param() { facilityId }: FacilityIdOperationParamsDto, @Res({ passthrough: true }) res: Response) {
    const { status, data } = await this.giftFacilityService.get(facilityId);

    res.status(status).send(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create a GIFT facility' })
  @ApiBody({
    required: true,
    type: GiftFacilityCreationRequestDto,
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

  @Post(':facilityId/amendment')
  @ApiOperation({ summary: 'Amend a GIFT facility - supports a subset of specific amendments available in GIFT' })
  @ApiParam({
    required: true,
    name: 'facilityId',
    type: 'string',
    description: 'The facility ID',
    example: EXAMPLES.GIFT.FACILITY_ID,
  })
  @ApiBody({
    required: true,
    type: CreateGiftFacilityAmendmentRequestDto,
  })
  @ApiCreatedResponse({
    description: 'The facility amendment',
    type: CreateGiftFacilityAmendmentResponseDto,
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
  async postAmendment(
    @Param() { facilityId }: FacilityIdOperationParamsDto,
    @Body(new ValidationPipe({ transform: true })) amendmentData: CreateGiftFacilityAmendmentRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { status, data } = await this.giftFacilityAmendmentService.create(facilityId, amendmentData);

    res.status(status).send(data);
  }

  /**
   * TEMPORARY: Enqueue a facility creation request.
   * This endpoint accepts the same payload as POST /gift/facility but places it on the
   * storage queue for async processing. It will replace the synchronous endpoint in future.
   */
  @Post('queue')
  @ApiOperation({ summary: 'TEMPORARY: Enqueue a GIFT facility creation request for async processing' })
  @ApiBody({
    required: true,
    type: GiftFacilityCreationRequestDto,
  })
  @ApiAcceptedResponse({
    description: 'The facility creation request has been accepted and queued',
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
  async postQueue(@Body(new ValidationPipe({ transform: true })) facilityData: GiftFacilityCreationRequestDto, @Res({ passthrough: true }) res: Response) {
    const {
      overview: { facilityId },
    } = facilityData;

    await this.giftQueueService.enqueue(facilityData);

    res.status(HttpStatus.ACCEPTED).send({ facilityId });
  }
}
