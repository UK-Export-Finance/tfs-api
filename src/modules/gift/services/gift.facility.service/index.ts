import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto, GiftFacilityOverviewRequestDto } from '../../dto';
import { mapAllValidationErrorResponses, mapResponseData, mapResponsesData } from '../../helpers';
import { GiftBusinessCalendarService } from '../gift.business-calendar.service';
import { GiftBusinessCalendarsConventionService } from '../gift.business-calendars-convention.service';
import { GiftCounterpartyService } from '../gift.counterparty.service';
import { GiftFacilityAsyncValidationService } from '../gift.facility-async-validation.service';
import { GiftFacilityCreationErrorService } from '../gift.facility-creation-error-service';
import { GiftFixedFeeService } from '../gift.fixed-fee.service';
import { GiftHttpService } from '../gift.http.service';
import { GiftObligationService } from '../gift.obligation.service';
import { GiftRepaymentProfileService } from '../gift.repayment-profile.service';
import { GiftRiskDetailsService } from '../gift.risk-details.service';
import { GiftStatusService } from '../gift.status.service';

const { API_RESPONSE_MESSAGES, PATH } = GIFT;

interface CreateFacilityResponse {
  status: AxiosResponse['status'];
  data: AxiosResponse['data'];
}

/**
 * GIFT facility service.
 * This is responsible for all facility operations that call the GIFT API.
 */
@Injectable()
export class GiftFacilityService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
    private readonly asyncValidationService: GiftFacilityAsyncValidationService,
    private readonly giftBusinessCalendarService: GiftBusinessCalendarService,
    private readonly giftBusinessCalendarsConventionService: GiftBusinessCalendarsConventionService,
    private readonly giftCounterpartyService: GiftCounterpartyService,
    private readonly giftFixedFeeService: GiftFixedFeeService,
    private readonly giftObligationService: GiftObligationService,
    private readonly giftRepaymentProfileService: GiftRepaymentProfileService,
    private readonly giftRiskDetailsService: GiftRiskDetailsService,
    private readonly giftStatusService: GiftStatusService,
    private readonly giftFacilityCreationErrorService: GiftFacilityCreationErrorService,
  ) {
    this.giftHttpService = giftHttpService;
    this.asyncValidationService = asyncValidationService;
    this.giftBusinessCalendarService = giftBusinessCalendarService;
    this.giftBusinessCalendarsConventionService = giftBusinessCalendarsConventionService;
    this.giftCounterpartyService = giftCounterpartyService;
    this.giftFixedFeeService = giftFixedFeeService;
    this.giftObligationService = giftObligationService;
    this.giftRepaymentProfileService = giftRepaymentProfileService;
    this.giftRiskDetailsService = giftRiskDetailsService;
    this.giftStatusService = giftStatusService;
    this.giftFacilityCreationErrorService = giftFacilityCreationErrorService;
  }

  /**
   * Get a GIFT facility by ID
   * @param {string} facilityId
   * @returns {Promise<AxiosResponse>}
   */
  async get(facilityId: UkefId): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting a GIFT facility %s', facilityId);

      const response = await this.giftHttpService.get<GiftFacilityOverviewRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}`,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting a GIFT facility %s %o', facilityId, error);

      throw new Error(`Error getting a GIFT facility ${facilityId}`, { cause: error });
    }
  }

  /**
   * Create a GIFT facility - initial/overview data
   * @param {GiftFacilityOverviewRequestDto} overviewData: Facility overview data
   * @returns {Promise<AxiosResponse>}
   */
  async createInitialFacility(overviewData: GiftFacilityOverviewRequestDto): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating an initial GIFT facility %s', overviewData.facilityId);

      const response = await this.giftHttpService.post<GiftFacilityCreationRequestDto>({
        path: PATH.CREATE_FACILITY,
        payload: overviewData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating an initial GIFT facility %s %o', overviewData.facilityId, error);

      throw new Error(`Error creating an initial GIFT facility ${overviewData.facilityId}`, { cause: error });
    }
  }

  /**
   * Create a GIFT facility
   * @param {GiftFacilityCreationRequestDto} data: Facility data
   * @param {string} facilityId: Facility ID
   * @returns {Promise<CreateFacilityResponse>}
   * @throws {AxiosError | Error}
   */
  async create(data: GiftFacilityCreationRequestDto, facilityId: string): Promise<CreateFacilityResponse> {
    /**
     * NOTE: When a GIFT facility is created, a work package is automatically created.
     * We need to reference this work package ID for the "finally" method at the end,
     * in the event of an error.
     *
     * NOTE: Additionally, a "catch error message" reference is used, so that in an error scenario,
     * where facility creation succeeds - a work package is created, but other calls fail,
     * the "finally" catch, can log out as much details as possible for debugging.
     */
    let success = false;
    let facilityWorkPackageId: number;
    let catchError: unknown;

    try {
      this.logger.info('Creating a GIFT facility %s', facilityId);

      const {
        overview,
        counterparties: counterpartiesPayload,
        fixedFees: fixedFeesPayload,
        obligations: obligationsPayload,
        repaymentProfiles: repaymentProfilesPayload,
      } = data;

      const validationErrors = await this.asyncValidationService.creation(data, facilityId);

      if (validationErrors.length) {
        return {
          status: HttpStatus.BAD_REQUEST,
          data: {
            error: 'Bad Request',
            statusCode: HttpStatus.BAD_REQUEST,
            message: API_RESPONSE_MESSAGES.ASYNC_FACILITY_VALIDATION_ERRORS,
            validationErrors,
          },
        };
      }

      const { data: facility, status } = await this.createInitialFacility(overview);

      /**
       * NOTE: If the initial facility creation fails, we should surface only this error and prevent subsequent calls.
       * Otherwise, subsequent calls will fail with errors unrelated to what is in the payload - could cause confusion.
       * E.g, a work package ID is required for counterparty creation - this ID comes from the initial facility creation.
       * If the initial facility creation fails and we attempt to create a counterparty, a work package ID error will be returned.
       */
      if (status !== HttpStatus.CREATED) {
        this.logger.error('Creating a GIFT facility - initial creation failed %s', facilityId);

        return {
          status,
          data: facility,
        };
      }

      const { workPackageId } = facility;

      facilityWorkPackageId = workPackageId;

      const { effectiveDate, expiryDate } = overview;

      const defaultBusinessCalendar = await this.giftBusinessCalendarService.createOne({
        facilityId,
        workPackageId,
        startDate: effectiveDate,
        exitDate: expiryDate,
      });

      const defaultBusinessCalendarsConvention = await this.giftBusinessCalendarsConventionService.createOne({ facilityId, workPackageId });

      const businessCalendars = [defaultBusinessCalendar];
      const businessCalendarsConvention = [defaultBusinessCalendarsConvention];

      const counterparties = await this.giftCounterpartyService.createMany(counterpartiesPayload, facilityId, workPackageId);

      const fixedFees = await this.giftFixedFeeService.createMany(fixedFeesPayload, facilityId, workPackageId);

      const obligations = await this.giftObligationService.createMany(obligationsPayload, facilityId, workPackageId);

      const repaymentProfiles = await this.giftRepaymentProfileService.createMany(repaymentProfilesPayload, facilityId, workPackageId);

      const riskDetails = await this.giftRiskDetailsService.createOne(data.riskDetails, facilityId, workPackageId);

      const riskDetailsArray = [riskDetails];

      const giftValidationErrors = mapAllValidationErrorResponses({
        businessCalendars,
        businessCalendarsConvention,
        counterparties,
        fixedFees,
        obligations,
        repaymentProfiles,
        riskDetails: riskDetailsArray,
      });

      if (giftValidationErrors.length) {
        this.logger.info('Creating a GIFT facility - returning validation errors %s', facilityId);

        const [firstError] = giftValidationErrors;

        /**
         * NOTE: Individual calls to GIFT could return different statuses.
         * We can only return one status.
         * Therefore, we return the status and message of the first entity response.
         */
        const { status, message: firstMessage } = firstError;

        let message = firstMessage;

        if (status === HttpStatus.BAD_REQUEST) {
          message = API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS;
        }

        return {
          status,
          data: {
            statusCode: status,
            message,
            validationErrors: giftValidationErrors,
          },
        };
      }

      const approvedStatusResponse = await this.giftStatusService.approved(facilityId, workPackageId);

      if (approvedStatusResponse.status !== HttpStatus.OK) {
        this.logger.error('Creating a GIFT facility - approved status update failed %s %o', facilityId, approvedStatusResponse);

        const cause = {
          status: approvedStatusResponse?.status,
          data: approvedStatusResponse?.data,
        };

        throw new Error(`Error creating a GIFT facility - approved status update failed ${facilityId}`, { cause });
      }

      this.logger.info('Creating a GIFT facility - success. Returning mapped response data %s', facilityId);

      const returnResponse = {
        status: HttpStatus.CREATED,
        data: {
          ...facility.configurationEvent.data,
          state: approvedStatusResponse.data.state,
          businessCalendars: mapResponsesData(businessCalendars),
          businessCalendarsConvention: mapResponseData(defaultBusinessCalendarsConvention),
          counterparties: mapResponsesData(counterparties),
          fixedFees: mapResponsesData(fixedFees),
          obligations: mapResponsesData(obligations),
          repaymentProfiles: mapResponsesData(repaymentProfiles),
          riskDetails: mapResponseData(riskDetails),
        },
      };

      /**
       * Everything succeeded. Change the success variable to true.
       * This is used in the finally block for error handling.
       */
      success = true;

      return returnResponse;
    } catch (error) {
      catchError = error;

      this.logger.error('Error creating a GIFT facility %s %o', facilityId, error);

      throw new Error(`Error creating a GIFT facility ${facilityId}`, { cause: error });
    } finally {
      /**
       * If anything during creation (apart from createInitialFacility) is unsuccessful / thrown an error,
       * call giftFacilityCreationErrorService.finallyHandler.
       */
      if (!success) {
        this.logger.error('Creating a GIFT facility - failed %s', facilityId);

        await this.giftFacilityCreationErrorService.finallyHandler({
          facilityId,
          workPackageId: facilityWorkPackageId,
          creationCatchError: catchError,
        });
      }

      /**
       * Everything succeeded. No further action required.
       * log a message for confirmation.
       */
      this.logger.info('Creating a GIFT facility - successfully completed %s', facilityId);
    }
  }
}
