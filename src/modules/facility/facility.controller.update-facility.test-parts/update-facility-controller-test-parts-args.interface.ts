import { UkefId, WithWarningErrors } from '@ukef/helpers';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { UpdateFacilityBundleIdentifierResponse, UpdateFacilityFacilityIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';

export interface UpdateFacilityControllerTestPartsArgs {
  updateFacilityRequest: UpdateFacilityRequest;
  serviceMethod: jest.Mock<any, any, any>;
  facilityIdentifier: UkefId;
  expectedResponse: UpdateFacilityFacilityIdentifierResponse | UpdateFacilityBundleIdentifierResponse;
  makeRequest: () => Promise<UpdateFacilityFacilityIdentifierResponse | WithWarningErrors<UpdateFacilityBundleIdentifierResponse>>;
  getGivenUpdateRequestWouldOtherwiseSucceed: () => void;
}
