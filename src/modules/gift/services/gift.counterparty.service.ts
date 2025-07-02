import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCounterpartyRequestDto, GiftFacilityCounterpartyRoleResponseDto } from '../dto';
import { mapCounterpartiesRequestData } from '../helpers';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, PATH } = GIFT;

/**
 * GIFT counterparty service.
 * This is responsible for all counterparty operations that call the GIFT API.
 */
@Injectable()
export class GiftCounterpartyService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT counterparty
   * @param {GiftFacilityCounterpartyRequestDto} counterpartyData: Counterparty data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(counterpartyData: GiftFacilityCounterpartyRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating a counterparty with URN %s for facility %s', counterpartyData.counterpartyUrn, facilityId);

      const response = await this.giftHttpService.post<GiftFacilityCounterpartyRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`,
        payload: counterpartyData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating a counterparty with URN %s for facility %s %o', counterpartyData.counterpartyUrn, facilityId, error);

      throw new Error(`Error creating a counterparty with URN ${counterpartyData.counterpartyUrn} for facility ${facilityId}`, error);
    }
  }

  /**
   * Create multiple GIFT counterparties
   * @param {Array<GiftFacilityCounterpartyRequestDto>} counterpartiesData: Counterparties data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(counterpartiesData: GiftFacilityCounterpartyRequestDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      this.logger.info('Creating counterparties for facility %s', facilityId);

      const mappedCounterparties = mapCounterpartiesRequestData(counterpartiesData);

      const responses = await Promise.all(
        mappedCounterparties.map((counterparty: GiftFacilityCounterpartyRequestDto) => this.createOne(counterparty, facilityId, workPackageId)),
      );

      return responses;
    } catch (error) {
      this.logger.error('Error creating counterparties for facility %s %o', facilityId, error);

      throw new Error(`Error creating counterparties for facility ${facilityId}`, error);
    }
  }

  /**
   * Get all GIFT counterparty roles
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async getAllRoles(): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting all counterparty roles');

      const response = await this.giftHttpService.get<GiftFacilityCounterpartyRoleResponseDto[]>({
        path: PATH.COUNTERPARTY_ROLES,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting all counterparty roles %o', error);

      throw new Error('Error getting all counterparty roles', error);
    }
  }
}
