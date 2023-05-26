import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';

import { AcbsDealBorrowingRestrictionService } from '../acbs/acbs-deal-borrowing-restriction.service';
import { AcbsUpdateDealBorrowingRestrictionRequest } from '../acbs/dto/acbs-update-deal-borrowing-restriction-request.dto';
import { AcbsAuthenticationService } from '../acbs-authentication/acbs-authentication.service';

@Injectable()
export class DealBorrowingRestrictionService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealBorrowingRestrictionService: AcbsDealBorrowingRestrictionService,
  ) {}

  async updateBorrowingRestrictionForDeal(dealIdentifier: string): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const borrowingRestrictionToUpdateInAcbs = this.buildBorrowingRestrictionToUpdateInAcbs();
    const idToken = await this.acbsAuthenticationService.getIdToken();

    return this.acbsDealBorrowingRestrictionService.updateBorrowingRestrictionForDeal(
      portfolioIdentifier,
      dealIdentifier,
      borrowingRestrictionToUpdateInAcbs,
      idToken,
    );
  }

  private buildBorrowingRestrictionToUpdateInAcbs(): AcbsUpdateDealBorrowingRestrictionRequest {
    const defaultValues = PROPERTIES.DEAL_BORROWING_RESTRICTION.DEFAULT;
    const borrowingRestrictionToUpdateInAcbs: AcbsUpdateDealBorrowingRestrictionRequest = {
      SequenceNumber: defaultValues.sequenceNumber,
      RestrictGroupCategory: {
        RestrictGroupCategoryCode: defaultValues.restrictGroupCategory.restrictGroupCategoryCode,
      },
      IncludingIndicator: defaultValues.includingIndicator,
      IncludeExcludeAllItemsIndicator: defaultValues.includeExcludeAllItemsIndicator,
    };
    return borrowingRestrictionToUpdateInAcbs;
  }
}
