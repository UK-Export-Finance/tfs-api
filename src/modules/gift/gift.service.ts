import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AxiosError, AxiosResponse } from 'axios';

import { GiftFacilityCounterpartyDto, GiftFacilityCreationDto, GiftFacilityDto } from './dto';
import { GiftHttpService } from './gift-http.service';
import { createBadRequestObject, filterResponsesWithInvalidStatus, mapResponsesData } from './helpers';

const { PATH } = GIFT;
/**
 * GIFT service.
 * This is responsible for all operations that call the GIFT API.
 */
@Injectable()
export class GiftService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  async getFacility(facilityId: UkefId): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.get<GiftFacilityDto>({
        path: `${GIFT.PATH.FACILITY}/${facilityId}`,
      });

      return response;
    } catch (error) {
      console.error('Error calling GIFT HTTP service GET method %o', error);

      throw new Error('Error calling GIFT HTTP service GET method', error);
    }
  }

  /**
   * Create a GIFT counterparty
   * @param {GiftFacilityCounterpartyDto} payload: Counterparty data
   * @returns {Promise<AxiosResponse>}
   */
  createCounterparty(payload: GiftFacilityCounterpartyDto, workPackageId: number): Promise<AxiosResponse> {
    return this.giftHttpService.post<GiftFacilityCounterpartyDto>({
      path: `${PATH.WORK_PACKAGE}/${workPackageId}${PATH.COUNTERPARTY}${PATH.CREATION_EVENT}`,
      payload,
    });
  }

  /**
   * Create multiple GIFT counterparties
   * @param {Array<GiftFacilityCounterpartyDto>} counterpartiesData: Counterparties data
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createCounterparties(counterpartiesData: GiftFacilityCounterpartyDto[], workPackageId: number): Promise<Array<AxiosResponse> | AxiosResponse> {
    const responses = await Promise.all(counterpartiesData.map((counterParty) => this.createCounterparty(counterParty, workPackageId)));

    /**
     * If any of the counterparty API calls has an invalid status,
     * create a single object with an array of all counterparty validation errors
     * and throw an error.
     * This allows a single response to be returned with all validation errors.
     * Without this, a consumer will receive a very large response with unnecessary nested datA.
     */
    const errors = filterResponsesWithInvalidStatus({ responses, expectedStatus: HttpStatus.CREATED });

    if (errors.length) {
      const badRequestObject = createBadRequestObject(errors);

      throw new Error('Error creating counterparties', { cause: badRequestObject });
    }

    return mapResponsesData(responses);
  }

  /**
   * Create a GIFT facility - initial/overview data
   * @param {GiftFacilityDto} payload: Facility overview data
   * @returns {Promise<AxiosResponse>}
   */
  async createInitialFacility(payload: GiftFacilityDto): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFacilityCreationDto>({
        path: GIFT.PATH.FACILITY,
        payload,
      });

      return response;
    } catch (error) {
      console.error('Error calling GIFT HTTP service POST method %o', error);

      throw new Error('Error calling GIFT HTTP service POST method', error);
    }
  }

  /**
   * Create a GIFT facility
   * @param {GiftFacilityCreationDto} data: Facility data
   * @returns {Promise<AxiosResponse>}
   * @throws {AxiosError | Error}
   */
  async createFacility(data: GiftFacilityCreationDto): Promise<AxiosResponse> {
    try {
      const { overview, counterparties: counterpartiesPayload } = data;

      const { data: facility } = await this.createInitialFacility(overview);

      const counterparties = await this.createCounterparties(counterpartiesPayload, facility.workPackageId);

      return {
        status: HttpStatus.CREATED,
        data: {
          ...facility,
          counterparties,
        },
      } as AxiosResponse;
    } catch (error) {
      console.error('Error creating GIFT facility %o', error);

      /**
       * If the error is an Axios error (as opposed to e.g, service unavailable),
       * Instead of throwing an error - surface the error.
       * This allows consumers to receive validation errors.
       */
      if (error instanceof AxiosError) {
        return {
          status: error.status,
          data: error.response?.data,
        } as AxiosResponse;
      }

      throw new Error('Error creating GIFT facility', error);
    }
  }
}
