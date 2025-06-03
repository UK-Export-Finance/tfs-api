import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCounterpartyDto } from './dto';
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
   * @param {GiftFacilityCounterpartyDto} counterpartyData: Counterparty data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(counterpartyData: GiftFacilityCounterpartyDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFacilityCounterpartyDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`,
        payload: counterpartyData,
      });

      return response;
    } catch (error) {
      // TODO: add "createing A/an"
      // TODO
      // TODO

      // TODO: and initial logs at the top of method
      this.logger.error('Error creating counterparty for facility %s %o', facilityId, error);

      throw new Error(`Error creating counterparty for facility ${facilityId}`, error);
    }
  }

  /**
   * Create multiple GIFT counterparties
   * @param {Array<GiftFacilityCounterpartyDto>} counterpartiesData: Counterparties data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(counterpartiesData: GiftFacilityCounterpartyDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      const responses = await Promise.all(counterpartiesData.map((counterParty) => this.createOne(counterParty, facilityId, workPackageId)));

      return responses;
    } catch (error) {
      this.logger.error('Error creating counterparties for facility %s %o', facilityId, error);

      throw new Error(`Error creating counterparties for facility ${facilityId}`, error);
    }
  }
}
