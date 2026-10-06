import { WhenMockWithMatchers } from 'jest-when';
import { WithWarningErrors } from '@ukef/helpers';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { UpdateFacilityBundleIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';

export type UpdateFacilityServiceTestPartsArgs<T> = {
  valueGenerator: RandomValueGenerator;
  updateFacilityRequest: UpdateFacilityRequest;
  acbsGetExistingFacilityResponse: AcbsGetFacilityResponseDto;
  expectedAcbsUpdateMethodRequest: T;
  expectedResult: undefined | WithWarningErrors<UpdateFacilityBundleIdentifierResponse>;
  updateFacility: (updateFacilityRequest: UpdateFacilityRequest) => Promise<void> | Promise<WithWarningErrors<UpdateFacilityBundleIdentifierResponse>>;
  expectAcbsUpdateMethodToBeCalledOnceWith: (acbsUpdateMethodRequest: T) => void;
  getAcbsFacilityServiceGetFacilityByIdentifierMock: () => jest.Mock;
  getAcbsUpdateMethodMock: () => jest.Mock;
  getAcbsGetFacilityRequestCalledCorrectlyMock: () => WhenMockWithMatchers<any, any>;
  mockSuccessfulAcbsUpdateMethod: () => void;
};
