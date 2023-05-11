import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsBundleInformationService } from '../acbs/acbs-bundleInformation.service';
// import { UkefId } from '@ukef/helpers';
import { CreateFacilityLoanResponseDto } from './dto/create-facility-loan-response.dto';
import { GetFacilityLoanResponseDto } from './dto/get-facility-loan-response.dto';
// import { FacilityLoanToCreate } from './facility-loan-to-create.interface';

@Injectable()
export class FacilityLoanService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityLoanService: AcbsFacilityLoanService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
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
        productTypeGroup: loan.ProductGroup.ProductGroupCode,
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

  async createLoanForFacility(): // facilityIdentifier: UkefId,
  // newFacilityLoan: FacilityLoanToCreate,
  Promise<CreateFacilityLoanResponseDto> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const bundleInformationToCreateInAcbs = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitiatingUserName: PROPERTIES.FACILITY_LOAN.DEFAULT.initiatingUserName,
      ServicingUserAccountIdentifier: 0,
    };
    const response = await this.acbsBundleInformationService.createBundleInformation(bundleInformationToCreateInAcbs, idToken);
    return { bundleIdentifier: response.BundleIdentifier };
  }
}
