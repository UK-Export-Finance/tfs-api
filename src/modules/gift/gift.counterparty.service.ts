import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { GiftFacilityCounterpartyDto } from './dto';
import { GiftHttpService } from './gift-http.service';

const { PATH } = GIFT;

/**
 * GIFT counterparty service.
 * This is responsible for all counterparty operations that call the GIFT API.
 */
@Injectable()
export class GiftCounterpartyService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT counterparty
   * @param {GiftFacilityCounterpartyDto} payload: Counterparty data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(payload: GiftFacilityCounterpartyDto, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFacilityCounterpartyDto>({
        path: `${PATH.WORK_PACKAGE}/${workPackageId}${PATH.COUNTERPARTY}${PATH.CREATION_EVENT}`,
        payload,
      });

      return response;
    } catch (error) {
      console.error('Error creating counterparty %o', error);

      throw new Error('Error creating counterparty', error);
    }
  }

  /**
   * Create multiple GIFT counterparties
   * @param {Array<GiftFacilityCounterpartyDto>} counterpartiesData: Counterparties data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(counterpartiesData: GiftFacilityCounterpartyDto[], workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      const responses = await Promise.all(counterpartiesData.map((counterParty) => this.createOne(counterParty, workPackageId)));

      return responses;
    } catch (error) {
      console.error('Error creating counterparties %o', error);

      throw new Error('Error creating counterparties', error);
    }
  }
}
