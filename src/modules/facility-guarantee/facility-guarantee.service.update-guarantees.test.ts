import { PROPERTIES } from '@ukef/constants';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityGuaranteeGenerator } from '@ukef-test/support/generator/get-facility-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsFacilityGuaranteeService } from '../acbs/acbs-facility-guarantee.service';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityGuaranteeService } from './facility-guarantee.service';

describe('FacilityGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const currentDateProvider = new CurrentDateProvider();
  const idToken = valueGenerator.string();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();

  let service: FacilityGuaranteeService;

  let getGuaranteesForFacilityFromAcbs: jest.Mock;
  let replaceGuaranteeForFacilityInAcbs: jest.Mock;

  beforeEach(() => {
    const acbsFacilityGuaranteeService = new AcbsFacilityGuaranteeService(null, null);
    getGuaranteesForFacilityFromAcbs = jest.fn();
    acbsFacilityGuaranteeService.getGuaranteesForFacility = getGuaranteesForFacilityFromAcbs;
    replaceGuaranteeForFacilityInAcbs = jest.fn();
    acbsFacilityGuaranteeService.replaceGuaranteeForFacility = replaceGuaranteeForFacilityInAcbs;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityGuaranteeService(acbsAuthenticationService, acbsFacilityGuaranteeService, dateStringTransformations, currentDateProvider);
  });

  describe('updateGuaranteesForFacility', () => {
    const { facilityGuaranteesInAcbs } = new GetFacilityGuaranteeGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 2,
      facilityIdentifier,
      portfolioIdentifier,
    });

    const expirationDateOnlyString = valueGenerator.dateOnlyString();
    const expirationDateTimeString = dateStringTransformations.addTimeToDateOnlyString(expirationDateOnlyString);
    const guaranteedLimit = valueGenerator.nonnegativeFloat();

    it('updates the guarantees in ACBS with the supplied fields', async () => {
      const updateRequest = { expirationDate: expirationDateOnlyString, guaranteedLimit };
      when(getGuaranteesForFacilityFromAcbs).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityGuaranteesInAcbs);

      await service.updateGuaranteesForFacility(facilityIdentifier, updateRequest);

      const updatedGuarantees = [
        { ...facilityGuaranteesInAcbs[0], ExpirationDate: expirationDateTimeString, GuaranteedLimit: guaranteedLimit },
        { ...facilityGuaranteesInAcbs[1], ExpirationDate: expirationDateTimeString, GuaranteedLimit: guaranteedLimit },
      ];

      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[0]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[0], idToken]);
      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[1]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[1], idToken]);
    });

    it('does not update ExpirationDate if expirationDate is not defined in the update request', async () => {
      const updateRequest = { guaranteedLimit };
      when(getGuaranteesForFacilityFromAcbs).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityGuaranteesInAcbs);

      await service.updateGuaranteesForFacility(facilityIdentifier, updateRequest);

      const updatedGuarantees = [
        { ...facilityGuaranteesInAcbs[0], GuaranteedLimit: guaranteedLimit },
        { ...facilityGuaranteesInAcbs[1], GuaranteedLimit: guaranteedLimit },
      ];

      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[0]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[0], idToken]);
      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[1]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[1], idToken]);
    });

    it('does not update GuaranteedLimit if guaranteedLimit is not defined in the update request', async () => {
      const updateRequest = { expirationDate: expirationDateOnlyString };
      when(getGuaranteesForFacilityFromAcbs).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityGuaranteesInAcbs);

      await service.updateGuaranteesForFacility(facilityIdentifier, updateRequest);

      const updatedGuarantees = [
        { ...facilityGuaranteesInAcbs[0], ExpirationDate: expirationDateTimeString },
        { ...facilityGuaranteesInAcbs[1], ExpirationDate: expirationDateTimeString },
      ];

      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[0]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[0], idToken]);
      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[1]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[1], idToken]);
    });

    it('does update GuaranteedLimit if guaranteedLimit is 0 in the update request', async () => {
      const updateRequest = { guaranteedLimit: 0 };
      when(getGuaranteesForFacilityFromAcbs).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityGuaranteesInAcbs);

      await service.updateGuaranteesForFacility(facilityIdentifier, updateRequest);

      const updatedGuarantees = [
        { ...facilityGuaranteesInAcbs[0], GuaranteedLimit: 0 },
        { ...facilityGuaranteesInAcbs[1], GuaranteedLimit: 0 },
      ];

      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[0]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[0], idToken]);
      expect(replaceGuaranteeForFacilityInAcbs.mock.calls[1]).toStrictEqual([portfolioIdentifier, facilityIdentifier, updatedGuarantees[1], idToken]);
    });
  });
});
