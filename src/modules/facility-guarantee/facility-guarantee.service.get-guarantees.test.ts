import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityGuaranteeService } from '@ukef/modules/acbs/acbs-facility-guarantee.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityGuaranteeGenerator } from '@ukef-test/support/generator/get-facility-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityGuaranteeService } from './facility-guarantee.service';

describe('FacilityGuaranteeService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityGuarantees: expectedFacilityGuarantees, facilityGuaranteesInAcbs } = new GetFacilityGuaranteeGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityGuaranteeService;

  let getFacilityGuaranteesAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityGuaranteeService(null, null);
    getFacilityGuaranteesAcbsService = jest.fn();
    acbsService.getGuaranteesForFacility = getFacilityGuaranteesAcbsService;

    service = new FacilityGuaranteeService(acbsAuthenticationService, acbsService, dateStringTransformations, new CurrentDateProvider());
  });

  describe('getGuaranteesForFacility', () => {
    it('returns a transformation of the guarantees from ACBS', async () => {
      when(getFacilityGuaranteesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityGuaranteesInAcbs);

      const guarantees = await service.getGuaranteesForFacility(facilityIdentifier);

      expect(guarantees).toStrictEqual(expectedFacilityGuarantees);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityGuaranteesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const guarantees = await service.getGuaranteesForFacility(facilityIdentifier);

      expect(guarantees).toStrictEqual([]);
    });
  });
});
