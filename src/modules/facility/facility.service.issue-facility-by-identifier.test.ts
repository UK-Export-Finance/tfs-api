import { PROPERTIES } from '@ukef/constants';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

import { AcbsFacilityService } from '../acbs/acbs-facility.service';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { UpdateFacilityRequest } from './dto/update-facility-request.dto';
import { FacilityService } from './facility.service';

describe('FacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const unissuedFacilityStageCode = TEST_FACILITY_STAGE_CODE.unissuedFacilityStageCode;

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
    it('updates a facility in ACBS with a transformation of the requested updated facility', async () => {
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(acbsGetExistingFacilityResponse);

      await issueFacility(updateFacilityRequest);

      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);
    });

    it('does not replace facility request data with existing facility data', async () => {
      const differentDealIdentifier = valueGenerator.ukefId();

      const modifiedAcbsGetExistingFacilityResponse = {
        ...acbsGetExistingFacilityResponse,
        DealIdentifier: differentDealIdentifier,
      };

      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(modifiedAcbsGetExistingFacilityResponse);

      await issueFacility(updateFacilityRequest);

      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);
    });

    it('uses existing facility data to fill missing update request data', async () => {
      const newFieldData = 'test';
      const modifiedAcbsGetExistingFacilityResponse = { ...acbsGetExistingFacilityResponse, NewField: newFieldData };
      const modifiedAcbsUpdateFacilityRequest = { ...acbsUpdateFacilityRequest, NewField: newFieldData };

      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(modifiedAcbsGetExistingFacilityResponse);

      await issueFacility(updateFacilityRequest);

      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, modifiedAcbsUpdateFacilityRequest, idToken);
    });

    it('removes AdministrativeUserIdentifier from the ACBS update request body', async () => {
      const modifiedAcbsGetExistingFacilityResponse = {
        ...acbsGetExistingFacilityResponse,
        AdministrativeUserIdentifier: valueGenerator.string(),
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(modifiedAcbsGetExistingFacilityResponse);

      await issueFacility(updateFacilityRequest);

      expect(acbsUpdateFacilityRequest).not.toHaveProperty('AdministrativeUserIdentifier');
    });

    // This is existing behaviour from previous implementations of this service and is maintained
    it('does not deep merge existing facility object data to fill missing update request data', async () => {
      const newRiskCountryCode = 'ZZZ';
      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, riskCountryCode: newRiskCountryCode };

      const newFieldValue = 'New Field';
      const modifiedAcbsGetExistingFacilityResponse = {
        ...acbsGetExistingFacilityResponse,
        RiskCountry: {
          CountryCode: acbsGetExistingFacilityResponse.RiskCountry.CountryCode,
          NewField: newFieldValue,
        },
      };

      const modifiedAcbsUpdateFacilityRequest = {
        ...acbsUpdateFacilityRequest,
        RiskCountry: { CountryCode: newRiskCountryCode },
      };

      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(modifiedAcbsGetExistingFacilityResponse);
      await issueFacility(modifiedUpdateFacilityRequest);

      expect(acbsFacilityServiceUpdateFacilityByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, modifiedAcbsUpdateFacilityRequest, idToken);
    });

    it('throws an error if facility is unissued', async () => {
      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, facilityStageCode: unissuedFacilityStageCode };

      const responsePromise = service.issueFacilityByIdentifier(facilityIdentifier, modifiedUpdateFacilityRequest);

      await expect(responsePromise).rejects.toThrow('Facility stage code is not issued');
    });
  });
});
