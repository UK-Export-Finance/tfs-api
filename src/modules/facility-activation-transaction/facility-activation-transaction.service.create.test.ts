import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/create-facility-activation-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityActivationTransactionService } from './facility-activation-transaction.service';

jest.mock('@ukef/modules/acbs/acbs-bundle-information.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('FacilityActivationTransactionService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.ukefId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const borrowerPartyIdentifier = valueGenerator.acbsPartyId();
  const effectiveDate = valueGenerator.dateOnlyString();
  const dateStringTransformations = new DateStringTransformations();

  let service: FacilityActivationTransactionService;

  let acbsBundleInformationServiceCreateBundleInformation: jest.Mock;

  beforeEach(() => {
    const acbsBundleInformationService = new AcbsBundleInformationService(null, null);
    acbsBundleInformationServiceCreateBundleInformation = jest.fn(() => ({
      BundleIdentifier: bundleIdentifier,
    }));
    acbsBundleInformationService.createBundleInformation = acbsBundleInformationServiceCreateBundleInformation;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityActivationTransactionService(acbsAuthenticationService, acbsBundleInformationService, dateStringTransformations);
  });

  describe('createActivationTransactionForFacility', () => {
    const { acbsRequestBodyToCreateFacilityActivationTransaction, requestBodyToCreateFacilityActivationTransaction } =
      new CreateFacilityActivationTransactionGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
        bundleIdentifier,
        borrowerPartyIdentifier,
        effectiveDate,
      });
    const newActivationTransactionWithAllFields = requestBodyToCreateFacilityActivationTransaction[0];

    it('creates a bundle information in ACBS with a transformation of the requested new activation-transaction', async () => {
      await service.createActivationTransactionForFacility(facilityIdentifier, borrowerPartyIdentifier, effectiveDate, newActivationTransactionWithAllFields);

      expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);
    });

    it('returns a bundle identifier from ACBS', async () => {
      const response = await service.createActivationTransactionForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        effectiveDate,
        newActivationTransactionWithAllFields,
      );

      expect(response).toEqual({ bundleIdentifier });
    });
  });
});
