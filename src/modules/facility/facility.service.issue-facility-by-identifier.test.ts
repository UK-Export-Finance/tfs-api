import { BadRequestException } from '@nestjs/common';
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
import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

describe('FacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const { unissuedFacilityStageCode } = TEST_FACILITY_STAGE_CODE;

  const issueFacility = (updateFacilityRequest: UpdateFacilityRequest): Promise<void> =>
    service.issueFacilityByIdentifier(facilityIdentifier, updateFacilityRequest);

  let acbsFacilityServiceUpdateFacilityByIdentifier: jest.Mock;
  let acbsFacilityServiceGetFacilityByIdentifier: jest.Mock;
  let service: FacilityService;

  beforeEach(() => {
    acbsFacilityServiceUpdateFacilityByIdentifier = jest.fn();
    const acbsFacilityService = new AcbsFacilityService(null, null);
    acbsFacilityService.updateFacilityByIdentifier = acbsFacilityServiceUpdateFacilityByIdentifier;

    const acbsBundleInformationService = new AcbsBundleInformationService(null, null);

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

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

  describe('issueFacilityByIdentifier', () => {
    it('throws an error if the new facility stage code is not issued', async () => {
      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, facilityStageCode: unissuedFacilityStageCode };

      const responsePromise = service.issueFacilityByIdentifier(facilityIdentifier, modifiedUpdateFacilityRequest);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Facility stage code is not issued');
    });

    it('throws an error if the issue date is not present', async () => {
      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest };

      delete modifiedUpdateFacilityRequest.issueDate;

      const responsePromise = service.issueFacilityByIdentifier(facilityIdentifier, modifiedUpdateFacilityRequest);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Issue date is not present');
    });

    it('throws an error if the issue date is null', async () => {
      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest };

      modifiedUpdateFacilityRequest.issueDate = null;

      const responsePromise = service.issueFacilityByIdentifier(facilityIdentifier, modifiedUpdateFacilityRequest);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Issue date is not present');
    });

    it('throws an error if the issue date is undefined', async () => {
      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest };

      modifiedUpdateFacilityRequest.issueDate = undefined;

      const responsePromise = service.issueFacilityByIdentifier(facilityIdentifier, modifiedUpdateFacilityRequest);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Issue date is not present');
    });

    const testArgs: UpdateFacilityServiceTestPartsArgs<AcbsUpdateFacilityRequest> = {
      valueGenerator,
      updateFacilityRequest,
      acbsGetExistingFacilityResponse,
      expectedAcbsUpdateMethodRequest: acbsUpdateFacilityRequest,
      expectedResult: undefined,
      updateFacility: issueFacility,
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

    const mockSuccessfulAcbsUpdateMethodMock = () => {
      when(acbsFacilityServiceUpdateFacilityByIdentifier).calledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken).mockReturnValueOnce(undefined);
    };

    const expectAcbsUpdateFacilityToBeCalledOnceWith = (acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest) => {
      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);
      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledTimes(1);
    };
  });
});
