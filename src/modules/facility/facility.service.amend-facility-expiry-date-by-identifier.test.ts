import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsUpdateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-update-facility-request.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { withAcbsUpdateFacilityRequestCreationTests } from '@ukef/modules/facility/facility.service.update-facility.test-parts/acbs-update-facility-request-creation-tests';
import { withUpdateFacilityServiceGeneralTests } from '@ukef/modules/facility/facility.service.update-facility.test-parts/update-facility-service-general-tests';
import { UpdateFacilityServiceTestPartsArgs } from '@ukef/modules/facility/facility.service.update-facility.test-parts/update-facility-service-test-parts-args.interface';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

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

    const acbsBundleInformationService = new AcbsBundleInformationService(null, null);

    acbsFacilityServiceUpdateFacilityByIdentifier = jest.fn();
    acbsFacilityService.updateFacilityByIdentifier = acbsFacilityServiceUpdateFacilityByIdentifier;

    acbsFacilityServiceGetFacilityByIdentifier = jest.fn();
    acbsFacilityService.getFacilityByIdentifier = acbsFacilityServiceGetFacilityByIdentifier;

    service = new FacilityService(
      acbsAuthenticationService,
      acbsBundleInformationService,
      acbsFacilityService,
      dateStringTransformations,
      new CurrentDateProvider(),
    );
  });

  const { updateFacilityRequest, acbsGetExistingFacilityResponse, acbsUpdateFacilityRequest } = new UpdateFacilityGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  describe('amendExpiryDateByIdentifier', () => {
    const testArgs: UpdateFacilityServiceTestPartsArgs<AcbsUpdateFacilityRequest> = {
      valueGenerator,
      updateFacilityRequest,
      acbsGetExistingFacilityResponse,
      expectedAcbsUpdateMethodRequest: acbsUpdateFacilityRequest,
      expectedResult: undefined,
      updateFacility: amendExpiryDateByIdentifier,
      expectAcbsUpdateMethodToBeCalledOnceWith: (acbsUpdateFacilityRequest) => expectAcbsUpdateFacilityToBeCalledOnceWith(acbsUpdateFacilityRequest),
      getAcbsGetFacilityRequestCalledCorrectlyMock: () => getAcbsGetFacilityRequestCalledCorrectlyMock(),
      getAcbsFacilityServiceGetFacilityByIdentifierMock: () => getAcbsFacilityServiceGetFacilityByIdentifierMock(),
      getAcbsUpdateMethodMock: () => getAcbsFacilityServiceUpdateFacilityByIdentifierMock(),
      mockSuccessfulAcbsUpdateMethod: () => mockSuccessfulAcbsUpdateMethodMock(),
    };

    withUpdateFacilityServiceGeneralTests(testArgs);

    withAcbsUpdateFacilityRequestCreationTests(testArgs);

    const getAcbsFacilityServiceGetFacilityByIdentifierMock = () => acbsFacilityServiceGetFacilityByIdentifier;
    const getAcbsFacilityServiceUpdateFacilityByIdentifierMock = () => acbsFacilityServiceUpdateFacilityByIdentifier;

    const getAcbsGetFacilityRequestCalledCorrectlyMock = () => when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken);

    const expectAcbsUpdateFacilityToBeCalledOnceWith = (acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest) => {
      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);
      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledTimes(1);
    };

    const mockSuccessfulAcbsUpdateMethodMock = () => {
      when(acbsFacilityServiceUpdateFacilityByIdentifier).calledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken).mockReturnValueOnce(undefined);
    };
  });
});
