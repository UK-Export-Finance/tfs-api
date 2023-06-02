import { UpdateFacilityControllerTestPartsArgs } from '@ukef/modules/facility/facility.controller.update-facility.test-parts/update-facility-controller-test-parts-args.interface';

export const withUpdateFacilityControllerGeneralTests = ({
  updateFacilityRequest,
  serviceMethod,
  facilityIdentifier,
  expectedResponse,
  makeRequest,
  getGivenUpdateRequestWouldOtherwiseSucceed,
}: UpdateFacilityControllerTestPartsArgs) => {
  describe('General update facility controller tests', () => {
    it(`calls correct service with correct arguments`, async () => {
      getGivenUpdateRequestWouldOtherwiseSucceed();

      await makeRequest();

      expect(serviceMethod).toHaveBeenCalledWith(facilityIdentifier, updateFacilityRequest);
    });

    it(`calls correct service once`, async () => {
      getGivenUpdateRequestWouldOtherwiseSucceed();

      await makeRequest();

      expect(serviceMethod).toHaveBeenCalledTimes(1);
    });

    it(`returns the expected response if updating the facility succeeds`, async () => {
      getGivenUpdateRequestWouldOtherwiseSucceed();

      const response = await makeRequest();

      expect(response).toStrictEqual(expectedResponse);
    });
  });
};
