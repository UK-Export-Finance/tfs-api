import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityLoanService } from './facility-loan.service';
import { RepaymentScheduleBuilder } from './repayment-schedule.builder';

describe('FacilityLoanService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const dateStringTransformations = new DateStringTransformations();

  const { facilityLoansFromApi: expectedFacilityLoans, facilityLoansInAcbs } = new GetFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate(
    { numberToGenerate: 2, facilityIdentifier, portfolioIdentifier },
  );

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanService;
  let acbsFacilityLoanService: AcbsFacilityLoanService;
  let acbsBundleInformationService: AcbsBundleInformationService;
  let repaymentScheduleBuilder: RepaymentScheduleBuilder;

  let acbsFacilityLoanServiceGetLoansForFacility: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsFacilityLoanService = new AcbsFacilityLoanService(null, null);
    acbsFacilityLoanServiceGetLoansForFacility = jest.fn();
    acbsFacilityLoanService.getLoansForFacility = acbsFacilityLoanServiceGetLoansForFacility;

    service = new FacilityLoanService(
      acbsAuthenticationService,
      acbsFacilityLoanService,
      acbsBundleInformationService,
      new DateStringTransformations(),
      new CurrentDateProvider(),
      repaymentScheduleBuilder,
    );
  });

  describe('getLoansForFacility', () => {
    it('returns a transformation of the loans from ACBS', async () => {
      when(acbsFacilityLoanServiceGetLoansForFacility).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityLoansInAcbs);

      const loans = await service.getLoansForFacility(facilityIdentifier);

      expect(loans).toStrictEqual(expectedFacilityLoans);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(acbsFacilityLoanServiceGetLoansForFacility).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const loans = await service.getLoansForFacility(facilityIdentifier);

      expect(loans).toStrictEqual([]);
    });
  });
});
