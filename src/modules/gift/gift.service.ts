import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AxiosResponse } from 'axios';

import { GiftFacilityCreationDto, GiftFacilityDto } from './dto';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftHttpService } from './gift-http.service';
import { mapResponsesData, mapValidationErrorResponses } from './helpers';

const { API_RESPONSE_MESSAGES, ENTITY_NAMES, PATH } = GIFT;

interface CreateFacilityResponse {
  status: AxiosResponse['status'];
  data: AxiosResponse['data'];
}

/**
 * GIFT service.
 * This is responsible for all operations that call the GIFT API.
 */
@Injectable()
export class GiftService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly giftCounterpartyService: GiftCounterpartyService,
  ) {
    this.giftHttpService = giftHttpService;
    this.giftCounterpartyService = giftCounterpartyService;
  }

  /**
   * Get a GIFT facility by ID
   * @param {String} facilityId
   * @returns {Promise<AxiosResponse>}
   */
  async getFacility(facilityId: UkefId): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.get<GiftFacilityDto>({
        path: `${PATH.FACILITY}/${facilityId}`,
      });

      return response;
    } catch (error) {
      console.error('Error calling GIFT HTTP service GET method %o', error);

      throw new Error('Error calling GIFT HTTP service GET method', error);
    }
  }

  /**
   * Create a GIFT facility - initial/overview data
   * @param {GiftFacilityDto} payload: Facility overview data
   * @returns {Promise<AxiosResponse>}
   */
  async createInitialFacility(payload: GiftFacilityDto): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFacilityCreationDto>({
        path: PATH.FACILITY,
        payload,
      });

      return response;
    } catch (error) {
      console.error('Error creating initial GIFT facility %o', error);

      throw new Error('Error creating initial GIFT facility', error);
    }
  }

  /**
   * Create a GIFT facility
   * @param {GiftFacilityCreationDto} data: Facility data
   * @returns {Promise<AxiosResponse>}
   * @throws {AxiosError | Error}
   */
  async createFacility(data: GiftFacilityCreationDto): Promise<CreateFacilityResponse> {
    try {
      const { overview, counterparties: counterpartiesPayload } = data;

      const { data: facility, status } = await this.createInitialFacility(overview);

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

      const counterparties = await this.giftCounterpartyService.createMany(counterpartiesPayload, facility.workPackageId);

      const validationErrors = mapValidationErrorResponses({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        responses: counterparties,
      });

      if (validationErrors.length) {
        const [firstError] = validationErrors;

        /**
         * NOTE: Individual calls to GIFT could return different statuses.
         * We can only return one status.
         * Therefore, we return the status and message of the first counterparty response.
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

      const mappedCounterparties = mapResponsesData(counterparties);

      return {
        status: HttpStatus.CREATED,
        data: {
          ...facility,
          counterparties: mappedCounterparties,
        },
      };
    } catch (error) {
      console.error('Error creating GIFT facility %o', error);

      throw new Error('Error creating GIFT facility', error);
    }
  }
}
