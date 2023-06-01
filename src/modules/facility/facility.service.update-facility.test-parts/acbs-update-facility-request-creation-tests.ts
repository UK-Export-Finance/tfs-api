import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { UpdateFacilityServiceTestPartsArgs } from '@ukef/modules/facility/facility.service.update-facility.test-parts/update-facility-service-test-parts-args.interface';

export const withAcbsUpdateFacilityRequestCreationTests = <T>({
  valueGenerator,
  updateFacilityRequest,
  acbsGetExistingFacilityResponse,
  expectedAcbsUpdateMethodRequest: acbsUpdateFacilityRequest,
  updateFacility,
  expectAcbsUpdateMethodToBeCalledOnceWith,
  getAcbsGetFacilityRequestCalledCorrectlyMock,
}: UpdateFacilityServiceTestPartsArgs<T>) => {
  describe('Creates ACBS update facility request', () => {
    const mockAcbsGetFacilityRequest = (acbsGetFacilityResponse: AcbsGetFacilityResponseDto) =>
      getAcbsGetFacilityRequestCalledCorrectlyMock().mockResolvedValueOnce(acbsGetFacilityResponse);

    it('does not update facility request data with existing facility data', async () => {
      const differentDealIdentifier = valueGenerator.ukefId();

      const modifiedAcbsGetExistingFacilityResponse = {
        ...acbsGetExistingFacilityResponse,
        DealIdentifier: differentDealIdentifier,
      };

      mockAcbsGetFacilityRequest(modifiedAcbsGetExistingFacilityResponse);

      await updateFacility(updateFacilityRequest);

      expectAcbsUpdateMethodToBeCalledOnceWith(acbsUpdateFacilityRequest);
    });

    it('uses existing facility data to fill missing update request data', async () => {
      const newFieldData = 'test';
      const modifiedAcbsGetExistingFacilityResponse = { ...acbsGetExistingFacilityResponse, NewField: newFieldData };
      const modifiedAcbsUpdateFacilityRequest = { ...acbsUpdateFacilityRequest, NewField: newFieldData };

      mockAcbsGetFacilityRequest(modifiedAcbsGetExistingFacilityResponse);

      await updateFacility(updateFacilityRequest);

      expectAcbsUpdateMethodToBeCalledOnceWith(modifiedAcbsUpdateFacilityRequest);
    });

    it('removes AdministrativeUserIdentifier from the ACBS update request body', async () => {
      const modifiedAcbsGetExistingFacilityResponse = {
        ...acbsGetExistingFacilityResponse,
        AdministrativeUserIdentifier: valueGenerator.string(),
      };
      mockAcbsGetFacilityRequest(modifiedAcbsGetExistingFacilityResponse);

      await updateFacility(updateFacilityRequest);

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

      mockAcbsGetFacilityRequest(modifiedAcbsGetExistingFacilityResponse);

      await updateFacility(modifiedUpdateFacilityRequest);

      expectAcbsUpdateMethodToBeCalledOnceWith(modifiedAcbsUpdateFacilityRequest);
    });
  });
};
