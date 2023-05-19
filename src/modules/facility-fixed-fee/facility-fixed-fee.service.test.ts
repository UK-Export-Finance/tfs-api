import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityFixedFeeService } from '@ukef/modules/acbs/acbs-facility-fixed-fee.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityFixedFeeService } from './facility-fixed-fee.service';

describe('FacilityFixedFeeService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { apiFacilityFixedFees: expectedFacilityFixedFees, acbsFacilityFixedFees } = new GetFacilityFixedFeeGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityFixedFeeService;

  let getFacilityFixedFeesAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityFixedFeeService(null, null);
    getFacilityFixedFeesAcbsService = jest.fn();
    acbsService.getFixedFeesForFacility = getFacilityFixedFeesAcbsService;

    service = new FacilityFixedFeeService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getFixedFeesForFacility', () => {
    it('returns a transformation of the guarantees from ACBS', async () => {
      when(getFacilityFixedFeesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(acbsFacilityFixedFees);

      const guarantees = await service.getFixedFeesForFacility(facilityIdentifier);

      expect(guarantees).toStrictEqual(expectedFacilityFixedFees);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityFixedFeesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const guarantees = await service.getFixedFeesForFacility(facilityIdentifier);

      expect(guarantees).toStrictEqual([]);
    });
  });
});
