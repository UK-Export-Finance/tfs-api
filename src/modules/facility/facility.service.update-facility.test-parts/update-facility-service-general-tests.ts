import { AcbsException } from '@ukef/modules/acbs/exception/acbs.exception';
import { UpdateFacilityServiceTestPartsArgs } from '@ukef/modules/facility/facility.service.update-facility.test-parts/update-facility-service-test-parts-args.interface';

export const withUpdateFacilityServiceGeneralTests = <T>({
  updateFacilityRequest,
  expectedAcbsUpdateMethodRequest,
  acbsGetExistingFacilityResponse,
  expectedResult,
  updateFacility,
  expectAcbsUpdateMethodToBeCalledOnceWith,
  getAcbsFacilityServiceGetFacilityByIdentifierMock,
  getAcbsUpdateMethodMock,
  getAcbsGetFacilityRequestCalledCorrectlyMock,
  mockSuccessfulAcbsUpdateMethod,
}: UpdateFacilityServiceTestPartsArgs<T>) => {
  describe('General update facility service tests', () => {
    const mockSuccessfulAcbsGetFacilityRequest = () => getAcbsGetFacilityRequestCalledCorrectlyMock().mockResolvedValueOnce(acbsGetExistingFacilityResponse);
    const mockUnsuccessfulAcbsGetFacilityRequest = () =>
      getAcbsGetFacilityRequestCalledCorrectlyMock().mockRejectedValue(new AcbsException(`Failed to get the facility`));

    it('returns the expected result', async () => {
      getAcbsGetFacilityRequestCalledCorrectlyMock().mockResolvedValueOnce(acbsGetExistingFacilityResponse);
      mockSuccessfulAcbsUpdateMethod();

      const result = await updateFacility(updateFacilityRequest);

      expect(result).toStrictEqual(expectedResult);
    });

    it('updates a facility in ACBS with the expected request', async () => {
      mockSuccessfulAcbsGetFacilityRequest();
      mockSuccessfulAcbsUpdateMethod();

      await updateFacility(updateFacilityRequest);

      expectAcbsUpdateMethodToBeCalledOnceWith(expectedAcbsUpdateMethodRequest);
    });

    it('does not call ACBS update facility service if ACBS get facility service does not return 200', async () => {
      mockUnsuccessfulAcbsGetFacilityRequest();
      mockSuccessfulAcbsUpdateMethod();

      const amendFacilityExpiryDateByIdentifier = updateFacility(updateFacilityRequest);

      await expect(amendFacilityExpiryDateByIdentifier).rejects.toBeInstanceOf(AcbsException);
      expect(getAcbsFacilityServiceGetFacilityByIdentifierMock()).toBeCalledTimes(1);
      expect(getAcbsUpdateMethodMock()).toBeCalledTimes(0);
    });
  });
};
