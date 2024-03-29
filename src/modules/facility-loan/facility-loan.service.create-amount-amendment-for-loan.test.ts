import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { LoanAdvanceTransaction } from '@ukef/modules/acbs/dto/bundle-actions/loan-advance-transaction.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityLoanAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-loan-amount-amendment.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const dateStringTransformations = new DateStringTransformations();
  const errorString = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanService;

  let getFacilityLoansAcbsService: jest.Mock;
  let createBundleInformation: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsFacilityLoanService = new AcbsFacilityLoanService(null, null);
    getFacilityLoansAcbsService = jest.fn();
    acbsFacilityLoanService.getLoansForFacility = getFacilityLoansAcbsService;

    const acbsBundleService = new AcbsBundleInformationService(null, null);
    createBundleInformation = jest.fn();
    acbsBundleService.createBundleInformation = createBundleInformation;

    service = new FacilityLoanService(
      acbsAuthenticationService,
      acbsFacilityLoanService,
      acbsBundleService,
      new DateStringTransformations(),
      new CurrentDateProvider(),
      null,
      null,
      null,
    );
  });

  describe('createAmountAmendmentForLoan', () => {
    const loanIdentifier = valueGenerator.loanId();
    const createdBundleIdentifier = valueGenerator.acbsBundleId();
    const acbsBundleCreatedResponse: AcbsCreateBundleInformationResponseHeadersDto = { BundleIdentifier: createdBundleIdentifier, WarningErrors: undefined };

    const { increaseAmountRequest, decreaseAmountRequest, acbsLoanAmendmentForIncrease, acbsLoanAmendmentForDecrease } =
      new CreateFacilityLoanAmountAmendmentGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1, loanIdentifier });
    const [increaseAmendment] = increaseAmountRequest;
    const [decreaseAmendment] = decreaseAmountRequest;

    describe('when creating a loan amendment bundle in ACBS that increases the amount', () => {
      const { transactionTypeCode } = PROPERTIES.LOAN_AMOUNT_AMENDMENT.DEFAULT.bundleMessageList;

      describe('with no header error', () => {
        beforeEach(() => {
          when(createBundleInformation).calledWith(acbsLoanAmendmentForIncrease, idToken).mockResolvedValueOnce(acbsBundleCreatedResponse);
        });

        it('returns the BundleIdentifier and warningErrors from creating the loan amendment bundle', async () => {
          const bundleIdentifier = await service.createAmountAmendmentForLoan(loanIdentifier, increaseAmendment);

          expect(bundleIdentifier).toStrictEqual({ responseBody: { bundleIdentifier: createdBundleIdentifier }, warningErrors: undefined });
        });

        it('uses the increase TransactionTypeCode when creating the loan amendment bundle', async () => {
          await service.createAmountAmendmentForLoan(loanIdentifier, increaseAmendment);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].TransactionTypeCode).toBe(transactionTypeCode.increase);
        });

        it('sets the amountAmendment as the LoanAdvanceAmount when creating the loan amendment bundle', async () => {
          await service.createAmountAmendmentForLoan(loanIdentifier, increaseAmendment);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].LoanAdvanceAmount).toBe(increaseAmendment.amountAmendment);
        });
      });

      it('returns the WarningErrors from creating the loan amendment bundle', async () => {
        when(createBundleInformation)
          .calledWith(acbsLoanAmendmentForIncrease, idToken)
          .mockResolvedValueOnce({ ...acbsBundleCreatedResponse, WarningErrors: errorString });
        const bundleIdentifier = await service.createAmountAmendmentForLoan(loanIdentifier, increaseAmendment);

        expect(bundleIdentifier).toEqual({ responseBody: { bundleIdentifier: createdBundleIdentifier }, warningErrors: errorString });
      });
    });

    describe('when creating a loan amendment bundle in ACBS that decreases the amount', () => {
      const { transactionTypeCode } = PROPERTIES.LOAN_AMOUNT_AMENDMENT.DEFAULT.bundleMessageList;

      describe('with no header error', () => {
        beforeEach(() => {
          when(createBundleInformation).calledWith(acbsLoanAmendmentForDecrease, idToken).mockResolvedValueOnce(acbsBundleCreatedResponse);
        });

        it('returns the bundleIdentifier from creating the loan amendment bundle', async () => {
          const bundleIdentifier = await service.createAmountAmendmentForLoan(loanIdentifier, decreaseAmendment);

          expect(bundleIdentifier).toStrictEqual({ responseBody: { bundleIdentifier: createdBundleIdentifier }, warningErrors: undefined });
        });

        it('uses the decrease TransactionTypeCode when creating the loan amendment bundle', async () => {
          await service.createAmountAmendmentForLoan(loanIdentifier, decreaseAmendment);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].TransactionTypeCode).toBe(transactionTypeCode.decrease);
        });

        it('sets the absolute value of the amountAmendment as the LoanAdvanceAmount when creating the loan amendment bundle', async () => {
          await service.createAmountAmendmentForLoan(loanIdentifier, decreaseAmendment);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].LoanAdvanceAmount).toBe(Math.abs(decreaseAmendment.amountAmendment));
        });
      });

      it('returns the WarningErrors from creating the loan amendment bundle', async () => {
        when(createBundleInformation)
          .calledWith(acbsLoanAmendmentForDecrease, idToken)
          .mockResolvedValueOnce({ ...acbsBundleCreatedResponse, WarningErrors: errorString });
        const bundleIdentifier = await service.createAmountAmendmentForLoan(loanIdentifier, decreaseAmendment);

        expect(bundleIdentifier).toEqual({ responseBody: { bundleIdentifier: createdBundleIdentifier }, warningErrors: errorString });
      });
    });

    const getBundleCreatedInAcbs = (): AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction> =>
      createBundleInformation.mock.calls[0][0] as AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction>;
  });
});
