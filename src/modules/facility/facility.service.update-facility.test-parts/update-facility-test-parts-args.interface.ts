import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { AcbsUpdateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-update-facility-request.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { WhenMockWithMatchers } from 'jest-when';

import { UpdateFacilityRequest } from '../dto/update-facility-request.dto';

export interface UpdateFacilityTestPartsArgs {
  valueGenerator: RandomValueGenerator;
  updateFacilityRequest: UpdateFacilityRequest;
  acbsGetExistingFacilityResponse: AcbsGetFacilityResponseDto;
  acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest;
  updateFacility: (updateFacilityRequest: UpdateFacilityRequest) => Promise<void>;
  expectAcbsUpdateFacilityToBeCalledWith: (acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest) => void;
  getAcbsFacilityServiceGetFacilityByIdentifierMock: () => jest.Mock<any, any, any>;
  getAcbsFacilityServiceUpdateFacilityByIdentifierMock: () => jest.Mock<any, any, any>;
  getAcbsGetFacilityRequestMock: () => WhenMockWithMatchers<any, any>;
}
