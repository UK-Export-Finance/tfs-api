import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityCovenantService } from '@ukef/modules/acbs/acbs-facility-covenant.service';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityCovenantService } from './facility-covenant.service';

jest.mock('@ukef/modules/date/current-date.provider');
jest.mock('@ukef/modules/acbs/acbs-facility-covenant.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('FacilityCovenantService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();

  let service: FacilityCovenantService;

  let acbsFacilityCovenantServiceGetCovenantsForFacility: jest.Mock;
  let acbsFacilityCovenantServiceReplaceCovenantForFacility: jest.Mock;

  beforeEach(() => {
    const acbsFacilityCovenantService = new AcbsFacilityCovenantService(null, null);
    acbsFacilityCovenantServiceGetCovenantsForFacility = jest.fn();
    acbsFacilityCovenantService.getCovenantsForFacility = acbsFacilityCovenantServiceGetCovenantsForFacility;
    acbsFacilityCovenantServiceReplaceCovenantForFacility = jest.fn();
    acbsFacilityCovenantService.replaceCovenantForFacility = acbsFacilityCovenantServiceReplaceCovenantForFacility;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityCovenantService(acbsAuthenticationService, acbsFacilityCovenantService, dateStringTransformations);
  });

  describe('updateCovenantsForFacility', () => {
    const { facilityCovenantsInAcbs } = new GetFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 2,
      facilityIdentifier,
      portfolioIdentifier,
    });

    const expirationDateOnlyString = valueGenerator.dateOnlyString();
    const expirationDateTimeString = dateStringTransformations.addTimeToDateOnlyString(expirationDateOnlyString);
    const targetAmount = valueGenerator.nonnegativeFloat();

    it('updates the covenants in ACBS with the supplied fields', async () => {
      const updateRequest = { expirationDate: expirationDateOnlyString, targetAmount };
      when(acbsFacilityCovenantServiceGetCovenantsForFacility)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityCovenantsInAcbs);

      await service.updateCovenantsForFacility(facilityIdentifier, updateRequest);

      const updatedCovenants = [
        { ...facilityCovenantsInAcbs[0], ExpirationDate: expirationDateTimeString, TargetAmount: targetAmount },
        { ...facilityCovenantsInAcbs[1], ExpirationDate: expirationDateTimeString, TargetAmount: targetAmount },
      ];

      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[0]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[0],
        idToken,
      ]);
      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[1]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[1],
        idToken,
      ]);
    });

    it('does not update ExpirationDate if expirationDate is not defined in the update request', async () => {
      const updateRequest = { targetAmount };
      when(acbsFacilityCovenantServiceGetCovenantsForFacility)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityCovenantsInAcbs);

      await service.updateCovenantsForFacility(facilityIdentifier, updateRequest);

      const updatedCovenants = [
        { ...facilityCovenantsInAcbs[0], TargetAmount: targetAmount },
        { ...facilityCovenantsInAcbs[1], TargetAmount: targetAmount },
      ];

      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[0]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[0],
        idToken,
      ]);
      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[1]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[1],
        idToken,
      ]);
    });

    it('does not update TargetAmount if targetAmount is not defined in the update request', async () => {
      const updateRequest = { expirationDate: expirationDateOnlyString };
      when(acbsFacilityCovenantServiceGetCovenantsForFacility)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityCovenantsInAcbs);

      await service.updateCovenantsForFacility(facilityIdentifier, updateRequest);

      const updatedCovenants = [
        { ...facilityCovenantsInAcbs[0], ExpirationDate: expirationDateTimeString },
        { ...facilityCovenantsInAcbs[1], ExpirationDate: expirationDateTimeString },
      ];

      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[0]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[0],
        idToken,
      ]);
      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[1]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[1],
        idToken,
      ]);
    });

    it('does update TargetAmount if targetAmount is 0 in the update request', async () => {
      const updateRequest = { targetAmount: 0 };
      when(acbsFacilityCovenantServiceGetCovenantsForFacility)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityCovenantsInAcbs);

      await service.updateCovenantsForFacility(facilityIdentifier, updateRequest);

      const updatedCovenants = [
        { ...facilityCovenantsInAcbs[0], TargetAmount: 0 },
        { ...facilityCovenantsInAcbs[1], TargetAmount: 0 },
      ];

      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[0]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[0],
        idToken,
      ]);
      expect(acbsFacilityCovenantServiceReplaceCovenantForFacility.mock.calls[1]).toStrictEqual([
        portfolioIdentifier,
        facilityIdentifier,
        updatedCovenants[1],
        idToken,
      ]);
    });
  });
});
