import { UkefId, WithWarningErrors } from '@ukef/helpers';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { UpdateFacilityBundleIdentifierResponse, UpdateFacilityFacilityIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';

export type UpdateFacilityControllerTestPartsArgs = {
  updateFacilityRequest: UpdateFacilityRequest;
  serviceMethod: jest.Mock;
  facilityIdentifier: UkefId;
  expectedResponse: UpdateFacilityFacilityIdentifierResponse | UpdateFacilityBundleIdentifierResponse;
  makeRequest: () => Promise<UpdateFacilityFacilityIdentifierResponse | WithWarningErrors<UpdateFacilityBundleIdentifierResponse>>;
  getGivenUpdateRequestWouldOtherwiseSucceed: () => void;
};
