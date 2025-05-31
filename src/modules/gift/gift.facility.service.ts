import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationDto, GiftFacilityOverviewDto } from './dto';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftHttpService } from './gift.http.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftStatusService } from './gift.status.service';
import { mapAllValidationErrorResponses, mapResponsesData } from './helpers';

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
    private readonly giftCounterpartyService: GiftCounterpartyService,
    private readonly giftFixedFeeService: GiftFixedFeeService,
    private readonly giftObligationService: GiftObligationService,
    private readonly giftRepaymentProfileService: GiftRepaymentProfileService,
    private readonly giftStatusService: GiftStatusService,
  ) {
    this.giftHttpService = giftHttpService;
    this.giftCounterpartyService = giftCounterpartyService;
    this.giftFixedFeeService = giftFixedFeeService;
    this.giftObligationService = giftObligationService;
    this.giftRepaymentProfileService = giftRepaymentProfileService;
    this.giftStatusService = giftStatusService;
  }

  /**
   * Get a GIFT facility by ID
   * @param {String} facilityId
   * @returns {Promise<AxiosResponse>}
   */
  async get(facilityId: UkefId): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.get<GiftFacilityOverviewDto>({
        path: `${PATH.FACILITY}/${facilityId}`,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting GIFT facility %o', error);

      throw new Error('Error getting GIFT facility', error);
    }
  }

  /**
   * Create a GIFT facility - initial/overview data
   * @param {GiftFacilityOverviewDto} overviewData: Facility overview data
   * @returns {Promise<AxiosResponse>}
   */
  async createInitialFacility(overviewData: GiftFacilityOverviewDto): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFacilityCreationDto>({
        path: PATH.CREATE_FACILITY,
        payload: overviewData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating initial GIFT facility %o', error);

      throw new Error('Error creating initial GIFT facility', error);
    }
  }

  /**
   * Create a GIFT facility
   * @param {GiftFacilityCreationDto} data: Facility data
   * @returns {Promise<CreateFacilityResponse>}
   * @throws {AxiosError | Error}
   */
  async create(data: GiftFacilityCreationDto): Promise<CreateFacilityResponse> {
    try {
      const {
        overview,
        counterparties: counterpartiesPayload,
        fixedFees: fixedFeesPayload,
        obligations: obligationsPayload,
        repaymentProfiles: repaymentProfilesPayload,
      } = data;

      const { data: facility, status } = await this.createInitialFacility(overview);

      const { facilityId } = overview;

      /**
       * NOTE: If the initial facility creation fails, we should surface only this error and prevent subsequent calls.
       * Otherwise, subsequent calls will fail with errors unrelated to what is in the payload - could cause confusion.
       * E.g, a work package ID is required for counterparty creation - this ID comes from the initial facility creation.
       * If the initial facility creation fails and we attempt to create a counterparty, a work package ID error will be returned.
       */
      if (status !== HttpStatus.CREATED) {
        return {
          status,
          data: facility,
        };
      }

      const { workPackageId } = facility;

      const counterparties = await this.giftCounterpartyService.createMany(counterpartiesPayload, facilityId, workPackageId);

      const fixedFees = await this.giftFixedFeeService.createMany(fixedFeesPayload, facilityId, workPackageId);

      const obligations = await this.giftObligationService.createMany(obligationsPayload, facilityId, workPackageId);

      const repaymentProfiles = await this.giftRepaymentProfileService.createMany(repaymentProfilesPayload, facilityId, workPackageId);

      const validationErrors = mapAllValidationErrorResponses({
        counterparties,
        fixedFees,
        obligations,
        repaymentProfiles,
      });

      if (validationErrors.length) {
        const [firstError] = validationErrors;

        /**
         * NOTE: Individual calls to GIFT could return different statuses.
         * We can only return one status.
         * Therefore, we return the status and message of the first entity response.
         */
        const { status, message: firstMessage } = firstError;

        let message = firstMessage;

        if (status === HttpStatus.BAD_REQUEST) {
          message = API_RESPONSE_MESSAGES.FACILITY_VALIDATION_ERRORS;
        }

        return {
          status,
          data: {
            statusCode: status,
            message,
            validationErrors,
          },
        };
      }

      const approvedStatusResponse = await this.giftStatusService.approved(facilityId, workPackageId);

      if (approvedStatusResponse.status !== HttpStatus.OK) {
        return {
          status: approvedStatusResponse.status,
          data: {
            statusCode: approvedStatusResponse.status,
            message: API_RESPONSE_MESSAGES.APPROVED_STATUS_ERROR_MESSAGE,
          },
        };
      }

      return {
        status: HttpStatus.CREATED,
        data: {
          ...facility.configurationEvent.data,
          state: approvedStatusResponse.data.state,
          counterparties: mapResponsesData(counterparties),
          fixedFees: mapResponsesData(fixedFees),
          obligations: mapResponsesData(obligations),
          repaymentProfiles: mapResponsesData(repaymentProfiles),
        },
      };
    } catch (error) {
      this.logger.error('Error creating GIFT facility %o', error);

      throw new Error('Error creating GIFT facility', error);
    }
  }
}
