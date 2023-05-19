import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleId } from '@ukef/helpers';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { LoanAdvanceTransaction } from '@ukef/modules/acbs/dto/bundle-actions/loan-advance-transaction.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateLoanAmountAmendmentRequestItem } from './dto/create-loan-amount-amendment-request.dto';
import { GetFacilityLoanResponseDto } from './dto/get-facility-loan-response.dto';

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
    const idToken = await this.getIdToken();
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

  async createAmountAmendmentForLoan(loanIdentifier: string, loanAmountAmendment: CreateLoanAmountAmendmentRequestItem): Promise<AcbsBundleId> {
    const idToken = await this.getIdToken();
    const loanAmountAmendmentBundle = this.buildLoanAmountAmendmentBundle(loanIdentifier, loanAmountAmendment);
    const { BundleIdentifier } = await this.acbsBundleInformationService.createBundleInformation(loanAmountAmendmentBundle, idToken);
    return BundleIdentifier;
  }

  private getIdToken(): Promise<string> {
    return this.acbsAuthenticationService.getIdToken();
  }

  private buildLoanAmountAmendmentBundle(
    loanIdentifier: string,
    loanAmountAmendment: CreateLoanAmountAmendmentRequestItem,
  ): AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const { bundleMessageList: messageListDefaultValues, ...defaultValues } = PROPERTIES.LOAN_AMOUNT_AMENDMENT.DEFAULT;
    const { increase: increaseTransactionTypeCode, decrease: decreaseTransactionTypeCode } = messageListDefaultValues.transactionTypeCode;

    const isIncrease = loanAmountAmendment.amountAmendment > 0;
    const transactionTypeCode = isIncrease ? increaseTransactionTypeCode : decreaseTransactionTypeCode;
    const loanAdvanceAmount = Math.abs(loanAmountAmendment.amountAmendment);
    const effectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(loanAmountAmendment.effectiveDate);

    return {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: defaultValues.initialBundleStatusCode,
      InitiatingUserName: defaultValues.initiatingUserName,
      UseAPIUserIndicator: defaultValues.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: messageListDefaultValues.type,
          EffectiveDate: effectiveDate,
          LoanIdentifier: loanIdentifier,
          TransactionTypeCode: transactionTypeCode,
          IsDraftIndicator: messageListDefaultValues.isDraftIndicator,
          CashOffsetTypeCode: messageListDefaultValues.cashOffsetTypeCode,
          LoanAdvanceAmount: loanAdvanceAmount,
        },
      ],
    };
  }
}
