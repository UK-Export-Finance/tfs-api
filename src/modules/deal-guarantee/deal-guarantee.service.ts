import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { roundTo2DecimalPlaces } from '@ukef/helpers/round-to-2-decimal-places.helper';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { AcbsCreateDealGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-deal-guarantee.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { GetDealGuaranteeResponse, GetDealGuaranteeResponseItem } from './dto/get-deal-guarantee-response.dto';
import { CreateDealGuaranteeRequestItem } from './dto/create-deal-guarantee-request.dto';

@Injectable()
export class DealGuaranteeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealGuaranteeService: AcbsDealGuaranteeService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) {}

  async createGuaranteeForDeal(dealIdentifier: string, newGuarantee: CreateDealGuaranteeRequestItem): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
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
      GuaranteedLimit: roundTo2DecimalPlaces(newGuarantee.maximumLiability),
      GuaranteedPercentage: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteedPercentage,
    };

    await this.acbsDealGuaranteeService.createGuaranteeForDeal(dealIdentifier, guaranteeToCreateInAcbs, idToken);
  }

  async getGuaranteesForDeal(dealIdentifier: UkefId): Promise<GetDealGuaranteeResponse> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const portfolio = PROPERTIES.GLOBAL.portfolioIdentifier;
    const guaranteesInAcbs = await this.acbsDealGuaranteeService.getGuaranteesForDeal(portfolio, dealIdentifier, idToken);

    return guaranteesInAcbs.map((guaranteeInAcbs): GetDealGuaranteeResponseItem => {
      return {
        portfolioIdentifier: portfolio,
        dealIdentifier: dealIdentifier,
        effectiveDate: this.dateStringTransformations.removeTimeIfExists(guaranteeInAcbs.EffectiveDate),
        guarantorParty: guaranteeInAcbs.GuarantorParty.PartyIdentifier,
        limitKey: guaranteeInAcbs.LimitKey,
        guaranteeExpiryDate: this.dateStringTransformations.removeTimeIfExists(guaranteeInAcbs.ExpirationDate),
        maximumLiability: guaranteeInAcbs.GuaranteedLimit,
        guaranteeTypeCode: guaranteeInAcbs.GuaranteeType.GuaranteeTypeCode,
      };
    });
  }
}
