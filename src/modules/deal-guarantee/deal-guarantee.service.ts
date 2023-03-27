import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { AcbsCreateDealGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-deal-guarantee.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsResourceNotFoundException } from '../acbs/exception/acbs-resource-not-found.exception';
import { DealGuaranteeToCreate } from './deal-guarantee-to-create.interface';
import { GetDealGuaranteeResponse } from './dto/get-deal-guarantee-response.dto';

@Injectable()
export class DealGuaranteeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealGuaranteeService: AcbsDealGuaranteeService,
    private readonly currentDateProvider: CurrentDateProvider,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async createGuaranteeForDeal(dealIdentifier: string, newGuarantee: DealGuaranteeToCreate): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const effectiveDateTime = this.currentDateProvider.getLatestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(newGuarantee.effectiveDate)),
    );
    const effectiveDateOnlyString = this.dateStringTransformations.removeTime(effectiveDateTime.toISOString());

    const guaranteeToCreateInAcbs: AcbsCreateDealGuaranteeDto = {
      LenderType: {
        LenderTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.lenderType.lenderTypeCode,
      },
      SectionIdentifier: PROPERTIES.DEAL_GUARANTEE.DEFAULT.sectionIdentifier,
      LimitType: {
        LimitTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.limitType.limitTypeCode,
      },
      LimitKey: newGuarantee.limitKey,
      GuarantorParty: {
        PartyIdentifier: newGuarantee.guarantorParty ?? PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty,
      },
      GuaranteeType: {
        GuaranteeTypeCode: newGuarantee.guaranteeTypeCode ?? PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode,
      },
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(effectiveDateOnlyString),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(newGuarantee.guaranteeExpiryDate),
      GuaranteedLimit: Math.round(newGuarantee.maximumLiability * 100) / 100,
      GuaranteedPercentage: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteedPercentage,
    };

    await this.acbsDealGuaranteeService.createGuaranteeForDeal(dealIdentifier, guaranteeToCreateInAcbs, idToken);
  }

  async getGuaranteeForDeal(dealIdentifier: string): Promise<GetDealGuaranteeResponse> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const guaranteesInAcbs = await this.acbsDealGuaranteeService.getGuaranteeForDeal(dealIdentifier, idToken);
    if (!guaranteesInAcbs) {
      throw new AcbsResourceNotFoundException(`Deal Guarantees for Deal ${dealIdentifier} were not found by ACBS.`);
    }
    return guaranteesInAcbs.map((guaranteeInAcbs) => ({
      dealIdentifier: dealIdentifier,
      portfolioIdentifier: 'E1',
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(guaranteeInAcbs.EffectiveDate),
      guarantorParty: guaranteeInAcbs.GuarantorParty.PartyIdentifier,
      limitKey: guaranteeInAcbs.LimitKey,
      guaranteeExpiryDate: this.dateStringTransformations.removeTimeIfExists(guaranteeInAcbs.ExpirationDate),
      maximumLiability: guaranteeInAcbs.GuaranteedLimit,
      guaranteeTypeCode: guaranteeInAcbs.GuaranteeType.GuaranteeTypeCode,
    }));
  }
}
