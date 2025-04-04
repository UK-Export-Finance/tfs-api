import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AxiosResponse } from 'axios';

import { GiftFacilityCounterpartyDto, GiftFacilityCreationDto, GiftFacilityDto } from './dto';
import { GiftHttpService } from './gift-http.service';
import { mapResponsesData, mapValidationErrorResponses } from './helpers';

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

  // TODO: documentation
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
  createCounterparties(counterpartiesData: GiftFacilityCounterpartyDto[], workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      return Promise.all(counterpartiesData.map((counterParty) => this.createCounterparty(counterParty, workPackageId)));
    } catch (error) {
      console.error('Error creating counterparties %o', error);

      throw new Error('Error creating counterparties', error);
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
        path: GIFT.PATH.FACILITY,
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
  async createFacility(data: GiftFacilityCreationDto): Promise<AxiosResponse> {
    try {
      const { overview, counterparties: counterpartiesPayload } = data;

      const facilityResponse = await this.createInitialFacility(overview);

      const { data: facility, status } = facilityResponse;

      /**
       * NOTE: IF the initial facility creation fails, we should surface only this error and prevent subsequent calls.
       * Otherwise, subsequent calls will fail with errors unrelated to what is in the payload - could cause confusion.
       * E.g, a work package ID is required for counterparty creation - this ID comes from the initial facility creation.
       * If the initial facility creation fails and we attempt to create a counterparty, a work package ID error will be returned.
       */
      if (status !== HttpStatus.CREATED) {
        return {
          status,
          data: facility,
        } as AxiosResponse;
      }

      // // @ts-ignore
      // counterpartiesPayload[0].exitDate = 123;

      // // @ts-ignore
      // counterpartiesPayload[1].startDate = 321;

      // // @ts-ignore
      // counterpartiesPayload[1].roleId = 11111;

      const counterparties = await this.createCounterparties(counterpartiesPayload, facility.workPackageId);

      const validationErrors = mapValidationErrorResponses({
        // TODO: constant
        entity: 'counterparty',
        responses: counterparties,
      });

      if (validationErrors.length) {
        return {
          status: HttpStatus.BAD_REQUEST,
          data: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation errors with facility entity(s)',
            validationErrors,
          },
        } as AxiosResponse;
      }

      return {
        status: HttpStatus.CREATED,
        data: {
          ...facility,
          counterparties: mapResponsesData(counterparties),
        },
      } as AxiosResponse;
    } catch (error) {
      console.error('Error creating GIFT facility %o', error);

      throw new Error('Error creating GIFT facility', error);
    }
  }
}
