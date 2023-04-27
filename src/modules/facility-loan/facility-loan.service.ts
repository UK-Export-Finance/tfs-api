import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { GetFacilityLoanResponseDto } from './dto/get-facility-loan-response.dto';

@Injectable()
export class FacilityLoanService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityLoanService: AcbsFacilityLoanService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getLoansForFacility(facilityIdentifier: string): Promise<GetFacilityLoanResponseDto> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const loansInAcbs = await this.acbsFacilityLoanService.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);
    return loansInAcbs.map((loan) => {
      return {
      portfolioIdentifier: loan.PortfolioIdentifier,
      loanIdentifier: loan.LoanIdentifier,
      facilityIdentifier: loan.ParentFacilityIdentifier,
      borrowerPartyIdentifier: loan.PrimaryParty.PartyIdentifier,
      productTypeId: loan.ProductType.ProductTypeCode,
      productTypeGroup: loan.ProductGroupCode,
      currency: loan.Currency.CurrencyCode,
      issueDate: this.dateStringTransformations.removeTime(loan.EffectiveDate),
      expiryDate: this.dateStringTransformations.removeTime(loan.MaturityDate),
      principalBalance: loan.PrincipalBalance,
      interestBalance: loan.InterestBalance,
      feeBalance: loan.FeeBalance,
      otherBalance: loan.OtherBalance,
      discountedPrincipal: loan.DiscountedPrincipal,
      };
    });
  }
}
