import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityCovenantService } from '@ukef/modules/acbs/acbs-facility-covenant.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityCovenantService } from './facility-covenant.service';

describe('FacilityCovenantService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityCovenantsFromApi: expectedFacilityCovenants, facilityCovenantsInAcbs } = new GetFacilityCovenantGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityCovenantService;

  let getFacilityCovenantsAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityCovenantService(null, null);
    getFacilityCovenantsAcbsService = jest.fn();
    acbsService.getCovenantsForFacility = getFacilityCovenantsAcbsService;

    service = new FacilityCovenantService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getCovenantsForFacility', () => {
    it('returns a transformation of the covenants from ACBS', async () => {
      when(getFacilityCovenantsAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityCovenantsInAcbs);

      const covenants = await service.getCovenantsForFacility(facilityIdentifier);

      expect(covenants).toStrictEqual(expectedFacilityCovenants);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityCovenantsAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const covenants = await service.getCovenantsForFacility(facilityIdentifier);

      expect(covenants).toStrictEqual([]);
    });
  });
});
