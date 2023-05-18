import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsBundleInformationService } from '../acbs/acbs-bundleInformation.service';
import { CurrentDateProvider } from '../date/current-date.provider';
import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanService', () => {
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityLoansFromApi: expectedFacilityLoans, facilityLoansInAcbs } = new GetFacilityLoanGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanService;
  let acbsFacilityLoanService: AcbsFacilityLoanService;
  let acbsBundleInformationService: AcbsBundleInformationService;

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
