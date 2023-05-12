import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { CreateFacilityRequestItem } from './dto/create-facility-request.dto';
import { FacilityService } from './facility.service';
import { withCreateFacilityCapitalConversionFactorCodeTests } from './facility.service.create-facility.test-parts/create-facility-capital-conversion-factor-code-tests';
import { withCreateFacilityDescriptionTests } from './facility.service.create-facility.test-parts/create-facility-description-tests';
import { withCreateFacilityEffectiveDateTests } from './facility.service.create-facility.test-parts/create-facility-effective-date-tests';
import { withCreateFacilityFacilityStageCodeDerivedValuesTests } from './facility.service.create-facility.test-parts/create-facility-facility-stage-code-derived-values-tests';
import { withCreateFacilitySimpleDefaultValuesTests } from './facility.service.create-facility.test-parts/create-facility-simple-default-values-tests';
import { CreateFacilityTestPartsArgs } from './facility.service.create-facility.test-parts/create-facility-test-parts-args.interface';

describe('FacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  let acbsFacilityServiceCreateFacility: jest.Mock;
  let service: FacilityService;

  beforeEach(() => {
    acbsFacilityServiceCreateFacility = jest.fn();
    const acbsFacilityService = new AcbsFacilityService(null, null);
    acbsFacilityService.createFacility = acbsFacilityServiceCreateFacility;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityService(acbsAuthenticationService, acbsFacilityService, dateStringTransformations, new CurrentDateProvider());
  });

  const { createFacilityRequestItem: facilityToCreate, acbsCreateFacilityRequest: expectedFacilityToCreateInAcbs } = new CreateFacilityGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  describe('createFacility', () => {
    const createFacility = (newFacility: CreateFacilityRequestItem): Promise<void> => service.createFacility(newFacility);

    const getFacilityCreatedInAcbs = (): AcbsCreateFacilityRequest => acbsFacilityServiceCreateFacility.mock.calls[0][1];

    it('creates a facility in ACBS with a transformation of the requested new facility', async () => {
      await createFacility(facilityToCreate);

      expect(acbsFacilityServiceCreateFacility).toHaveBeenCalledWith(portfolioIdentifier, expectedFacilityToCreateInAcbs, idToken);
    });

    const testArgs: CreateFacilityTestPartsArgs = {
      valueGenerator,
      dateStringTransformations,
      facilityToCreate,
      createFacility,
      getFacilityCreatedInAcbs,
    };

    withCreateFacilityCapitalConversionFactorCodeTests(testArgs);

    withCreateFacilityDescriptionTests(testArgs);

    withCreateFacilityEffectiveDateTests(testArgs);

    withCreateFacilityFacilityStageCodeDerivedValuesTests(testArgs);

    withCreateFacilitySimpleDefaultValuesTests(testArgs);
  });
});
