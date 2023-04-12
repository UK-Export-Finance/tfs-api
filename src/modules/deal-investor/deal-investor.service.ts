import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsDealPartyService } from '@ukef/modules/acbs/acbs-deal-party.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsCreateDealInvestorRequest } from '../acbs/dto/acbs-create-deal-investor-request.dto';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DealInvestor } from './deal-investor.interface';
import { CreateDealInvestorRequestItem } from './dto/create-deal-investor-request.dto';

@Injectable()
export class DealInvestorService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealPartyService: AcbsDealPartyService,
    private readonly currentDateProvider: CurrentDateProvider,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getDealInvestors(dealIdentifier: UkefId): Promise<DealInvestor[]> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const portfolio = PROPERTIES.GLOBAL.portfolioIdentifier;
    const investorsInAcbs = await this.acbsDealPartyService.getDealPartiesForDeal(portfolio, dealIdentifier, idToken);

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

  async createInvestorForDeal(dealIdentifier: string, newInvestor: CreateDealInvestorRequestItem): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(newInvestor.effectiveDate)),
    );
    const effectiveDateString = this.dateStringTransformations.getDateStringFromDate(effectiveDateTime);

    const expiryDateOnlyString = newInvestor.expiryDate;
    const expirationDateString = expiryDateOnlyString
      ? this.dateStringTransformations.addTimeToDateOnlyString(expiryDateOnlyString)
      : PROPERTIES.DEAL_INVESTOR.DEFAULT.expirationDate;

    const investorToCreateInAcbs: AcbsCreateDealInvestorRequest = {
      SectionIdentifier: PROPERTIES.DEAL_INVESTOR.DEFAULT.sectionIdentifier,
      EffectiveDate: effectiveDateString,
      ExpirationDate: expirationDateString,
      IsExpirationDateMaximum: newInvestor.expiryDate ? false : true,
      LenderType: {
        LenderTypeCode: newInvestor.lenderType ?? PROPERTIES.DEAL_INVESTOR.DEFAULT.lenderType.lenderTypeCode,
      },
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.DEAL_INVESTOR.DEFAULT.involvedParty.partyIdentifier,
      },
      Currency: {
        CurrencyCode: newInvestor.currency,
      },
      CustomerAdvisedIndicator: PROPERTIES.DEAL_INVESTOR.DEFAULT.customerAdvisedIndicator,
      DealStatus: {
        DealStatusCode: newInvestor.dealStatus ?? PROPERTIES.DEAL_INVESTOR.DEFAULT.dealStatus.dealStatusCode,
      },
      UserDefinedCode1: PROPERTIES.DEAL_INVESTOR.DEFAULT.userDefinedCode1,
      ContractPercentage: PROPERTIES.DEAL_INVESTOR.DEFAULT.contractPercentage,
      LimitRevolvingIndicator: PROPERTIES.DEAL_INVESTOR.DEFAULT.limitRevolvingIndicator,
    };

    await this.acbsDealPartyService.createInvestorForDeal(dealIdentifier, investorToCreateInAcbs, idToken);
  }
}
