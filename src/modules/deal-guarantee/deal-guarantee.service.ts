import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { AcbsCreateDealGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-deal-guarantee.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/helpers';

import { AcbsResourceNotFoundException } from '../acbs/exception/acbs-resource-not-found.exception';
import { DealGuaranteeToCreate } from './deal-guarantee-to-create.interface';
import { GetDealGuaranteeResponse } from './dto/get-deal-guarantee-response.dto';

@Injectable()
export class DealGuaranteeService {
  // TODO: make DateStringTransformations injectable, maybe it needs to be part of module for this to work.
  private readonly dateStringTransformations: DateStringTransformations = new DateStringTransformations();

  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealGuaranteeService: AcbsDealGuaranteeService,
    private readonly currentDateProvider: CurrentDateProvider,
  ) {}

  async createGuaranteeForDeal(dealIdentifier: string, newGuarantee: DealGuaranteeToCreate): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const effectiveDateTime = this.currentDateProvider.getLatestDateFromTodayAnd(new Date(newGuarantee.effectiveDate + 'T00:00:00Z'));
    const effectiveDateOnlyString = effectiveDateTime.toISOString().split('T')[0];

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
      EffectiveDate: effectiveDateOnlyString + 'T00:00:00Z',
      ExpirationDate: newGuarantee.guaranteeExpiryDate + 'T00:00:00Z',
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
