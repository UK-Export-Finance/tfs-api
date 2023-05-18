import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsBundleInformationService } from '../acbs/acbs-bundleInformation.service';
import { CurrentDateProvider } from '../date/current-date.provider';
import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const dateStringTransformations = new DateStringTransformations();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanService;
  let acbsFacilityLoanService: AcbsFacilityLoanService;
  let acbsBundleInformationService: AcbsBundleInformationService;

  let acbsBundleInformationServiceCreateBundleInformation: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsBundleInformationService = new AcbsBundleInformationService(null, null);
    acbsBundleInformationServiceCreateBundleInformation = jest.fn(() => ({
      BundleIdentifier: bundleIdentifier,
    }));
    acbsBundleInformationService.createBundleInformation = acbsBundleInformationServiceCreateBundleInformation;

    service = new FacilityLoanService(
      acbsAuthenticationService,
      acbsFacilityLoanService,
      acbsBundleInformationService,
      new DateStringTransformations(),
      new CurrentDateProvider(),
    );
  });

  describe('createLoanForFacility', () => {
    const { acbsRequestBodyToCreateFacilityLoan, requestBodyToCreateFacilityLoan } = new CreateFacilityLoanGenerator(
      valueGenerator,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      bundleIdentifier,
    });
    const newLoanWithAllFields = requestBodyToCreateFacilityLoan[0];

    it('creates a bundle information in ACBS with a transformation of the requested new loan', async () => {
      await service.createLoanForFacility(facilityIdentifier, newLoanWithAllFields);

      expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoan, idToken);
    });

    it('returns a bundle identifier from ACBS', async () => {
      const response = await service.createLoanForFacility(facilityIdentifier, newLoanWithAllFields);

      expect(response).toEqual({ bundleIdentifier });
    });
  });
});
