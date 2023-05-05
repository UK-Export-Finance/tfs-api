import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsFacilityLoanTransactionService } from '../acbs/acbs-facility-loan-transaction.service';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

describe('FacilityLoanTransactionService', () => {
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityLoanTransactionsFromApi: expectedFacilityLoanTransactions, facilityLoanTransactionsInAcbs } = new GetFacilityLoanTransactionGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanTransactionService;

  let getFacilityLoanTransactionsAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityLoanTransactionService(null, null);
    getFacilityLoanTransactionsAcbsService = jest.fn();
    acbsService.getLoanTransactionsForFacility = getFacilityLoanTransactionsAcbsService;

    service = new FacilityLoanTransactionService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getLoanTransactionsForFacility', () => {
    it('returns a transformation of the loanTransactions from ACBS', async () => {
      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbs);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactions);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityLoanTransactionsAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual([]);
    });
  });
});
