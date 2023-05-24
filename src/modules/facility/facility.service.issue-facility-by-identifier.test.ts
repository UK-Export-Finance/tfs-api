import { BadRequestException } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';
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

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsFacilityServiceGetFacilityByIdentifier = jest.fn();
    acbsFacilityService.getFacilityByIdentifier = acbsFacilityServiceGetFacilityByIdentifier;

    service = new FacilityService(acbsAuthenticationService, acbsFacilityService, dateStringTransformations, new CurrentDateProvider());
  });

  const { updateFacilityRequest, acbsGetExistingFacilityResponse, acbsUpdateFacilityRequest } = new UpdateFacilityGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  describe('issueFacilityByIdentifier', () => {
    const getAcbsFacilityServiceGetFacilityByIdentifierMock = () => acbsFacilityServiceGetFacilityByIdentifier;
    const getAcbsFacilityServiceUpdateFacilityByIdentifierMock = () => acbsFacilityServiceUpdateFacilityByIdentifier;

    const getAcbsGetFacilityRequestMock = () => when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken);

    const expectAcbsUpdateFacilityToBeCalledWith = (acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest) =>
      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);

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

    const testArgs: UpdateFacilityTestPartsArgs = {
      valueGenerator,
      updateFacilityRequest,
      acbsGetExistingFacilityResponse,
      acbsUpdateFacilityRequest,
      updateFacility: issueFacility,
      expectAcbsUpdateFacilityToBeCalledWith,
      getAcbsGetFacilityRequestMock,
      getAcbsFacilityServiceGetFacilityByIdentifierMock,
      getAcbsFacilityServiceUpdateFacilityByIdentifierMock,
    };

    withUpdateFacilityGeneralTests(testArgs);

    withAcbsUpdateFacilityRequestCreationTests(testArgs);
  });
});
