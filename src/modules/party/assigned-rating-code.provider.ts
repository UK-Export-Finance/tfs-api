import { Injectable } from '@nestjs/common';
import { ENUMS } from '@ukef/constants';
import { AssignedRatingCodeEnum } from '@ukef/constants/enums/assigned-rating-code';
import { SOVEREIGN_ACCOUNT_TYPES } from '@ukef/constants/sovereign-account-types.constant';

import { PartyCustomerTypeService } from './party-customer-type.service';

@Injectable()
export class AssignedRatingCodeProvider {
  constructor(private readonly partyCustomerTypeService: PartyCustomerTypeService) {}

  async getAssignedRatingCodeForPartyAlternateIdentifier(alternateIdentifier: string): Promise<AssignedRatingCodeEnum> {
    const partyCustomerType = await this.partyCustomerTypeService.getCustomerTypeForPartyFromAlternateIdentifier({
      alternateIdentifier,
      fallbackIfNotFound: null,
    });
    return this.isASovereignCustomerType(partyCustomerType) ? ENUMS.ASSIGNED_RATING_CODES.SOVEREIGN : ENUMS.ASSIGNED_RATING_CODES.CORPORATE;
  }

  private isASovereignCustomerType(partyCustomerType: string | null): boolean {
    return SOVEREIGN_ACCOUNT_TYPES.includes(partyCustomerType);
  }
}
