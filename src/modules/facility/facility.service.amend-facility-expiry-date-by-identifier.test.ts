import { PROPERTIES } from '@ukef/constants';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

import { AcbsFacilityService } from '../acbs/acbs-facility.service';
import { AcbsUpdateFacilityRequest } from '../acbs/dto/acbs-update-facility-request.dto';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { UpdateFacilityRequest } from './dto/update-facility-request.dto';
import { FacilityService } from './facility.service';
import { withAcbsUpdateFacilityRequestCreationTests } from './facility.service.update-facility.test-parts/acbs-update-facility-request-creation-tests';
import { withUpdateFacilityGeneralTests } from './facility.service.update-facility.test-parts/update-facility-general-tests';
import { UpdateFacilityTestPartsArgs } from './facility.service.update-facility.test-parts/update-facility-test-parts-args.interface';

describe('FacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const amendExpiryDateByIdentifier = (updateFacilityRequest: UpdateFacilityRequest): Promise<void> =>
    service.amendFacilityExpiryDateByIdentifier(facilityIdentifier, updateFacilityRequest);

  let acbsFacilityServiceUpdateFacilityByIdentifier: jest.Mock;
  let acbsFacilityServiceGetFacilityByIdentifier: jest.Mock;
  let service: FacilityService;

  beforeEach(() => {
    const acbsFacilityService = new AcbsFacilityService(null, null);

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsFacilityServiceUpdateFacilityByIdentifier = jest.fn();
    acbsFacilityService.updateFacilityByIdentifier = acbsFacilityServiceUpdateFacilityByIdentifier;

    acbsFacilityServiceGetFacilityByIdentifier = jest.fn();
    acbsFacilityService.getFacilityByIdentifier = acbsFacilityServiceGetFacilityByIdentifier;

    service = new FacilityService(acbsAuthenticationService, acbsFacilityService, dateStringTransformations, new CurrentDateProvider());
  });

  const { updateFacilityRequest, acbsGetExistingFacilityResponse, acbsUpdateFacilityRequest } = new UpdateFacilityGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  describe('amendExpiryDateByIdentifier', () => {
    const getAcbsFacilityServiceGetFacilityByIdentifierMock = () => acbsFacilityServiceGetFacilityByIdentifier;
    const getAcbsFacilityServiceUpdateFacilityByIdentifierMock = () => acbsFacilityServiceUpdateFacilityByIdentifier;

    const getAcbsGetFacilityRequestMock = () => when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken);

    const expectAcbsUpdateFacilityToBeCalledWith = (acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest) =>
      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);

    const testArgs: UpdateFacilityTestPartsArgs = {
      valueGenerator,
      updateFacilityRequest,
      acbsGetExistingFacilityResponse,
      acbsUpdateFacilityRequest,
      updateFacility: amendExpiryDateByIdentifier,
      expectAcbsUpdateFacilityToBeCalledWith,
      getAcbsGetFacilityRequestMock,
      getAcbsFacilityServiceGetFacilityByIdentifierMock,
      getAcbsFacilityServiceUpdateFacilityByIdentifierMock,
    };

    withUpdateFacilityGeneralTests(testArgs);

    withAcbsUpdateFacilityRequestCreationTests(testArgs);
  });
});
