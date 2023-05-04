import { AcbsException } from '@ukef/modules/acbs/exception/acbs.exception';

import { UpdateFacilityTestPartsArgs } from './update-facility-test-parts-args.interface';

export const withUpdateFacilityGeneralTests = ({
  updateFacilityRequest,
  acbsUpdateFacilityRequest,
  acbsGetExistingFacilityResponse,
  updateFacility,
  expectAcbsUpdateFacilityToBeCalledWith,
  getAcbsFacilityServiceGetFacilityByIdentifierMock,
  getAcbsFacilityServiceUpdateFacilityByIdentifierMock,

  getAcbsGetFacilityRequestMock,
}: UpdateFacilityTestPartsArgs) => {
  describe('General update facility tests', () => {
    const mockSuccessfulAcbsGetFacilityRequest = () => getAcbsGetFacilityRequestMock().mockResolvedValueOnce(acbsGetExistingFacilityResponse);
    const mockUnsuccessfulAcbsGetFacilityRequest = () => getAcbsGetFacilityRequestMock().mockRejectedValue(new AcbsException(`Failed to get the facility`));

    it('updates a facility in ACBS with the expected request', async () => {
      mockSuccessfulAcbsGetFacilityRequest();

      await updateFacility(updateFacilityRequest);

      expectAcbsUpdateFacilityToBeCalledWith(acbsUpdateFacilityRequest);
    });
    it('does not call ACBS update facility service if ACBS get facility service does not return 200', async () => {
      mockUnsuccessfulAcbsGetFacilityRequest();

      const amendFacilityExpiryDateByIdentifier = updateFacility(updateFacilityRequest);

      await expect(amendFacilityExpiryDateByIdentifier).rejects.toBeInstanceOf(AcbsException);
      expect(getAcbsFacilityServiceGetFacilityByIdentifierMock()).toBeCalledTimes(1);
      expect(getAcbsFacilityServiceUpdateFacilityByIdentifierMock()).toBeCalledTimes(0);
    });
  });
};
