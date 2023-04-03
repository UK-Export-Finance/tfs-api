import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealPartyService } from '@ukef/modules/acbs/acbs-deal-party.service';
import { AcbsResourceNotFoundException } from '@ukef/modules/acbs/exception/acbs-resource-not-found.exception';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { DealInvestor } from './deal-investor.interface';

@Injectable()
export class DealInvestorService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealPartyService: AcbsDealPartyService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getDealInvestors(dealIdentifier: UkefId): Promise<DealInvestor[]> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const portfolio = PROPERTIES.GLOBAL.portfolioIdentifier;
    const investorsInAcbs = await this.acbsDealPartyService.getDealPartiesForDeal(portfolio, dealIdentifier, idToken);
    if (!investorsInAcbs || investorsInAcbs.length === 0) {
      throw new AcbsResourceNotFoundException(`Deal Investors for Deal ${dealIdentifier} were not found by ACBS.`);
    }
    return investorsInAcbs.map((investorInAcbs) => ({
      dealIdentifier,
      portfolioIdentifier: portfolio,
      lenderType: { LenderTypeCode: investorInAcbs.LenderType.LenderTypeCode },
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(investorInAcbs.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTimeIfExists(investorInAcbs.ExpirationDate),
      isExpiryDateMaximum: investorInAcbs.IsExpirationDateMaximum,
      maximumLiability: investorInAcbs.LimitAmount,
    }));
  }
}
