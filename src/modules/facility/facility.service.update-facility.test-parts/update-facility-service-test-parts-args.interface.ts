import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { UpdateFacilityBundleIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { WhenMock, WhenMockWithMatchers } from 'jest-when';

export interface UpdateFacilityServiceTestPartsArgs<T> {
  valueGenerator: RandomValueGenerator;
  updateFacilityRequest: UpdateFacilityRequest;
  acbsGetExistingFacilityResponse: AcbsGetFacilityResponseDto;
  expectedAcbsUpdateMethodRequest: T;
  expectedResult: undefined | UpdateFacilityBundleIdentifierResponse;
  updateFacility: (updateFacilityRequest: UpdateFacilityRequest) => Promise<void> | Promise<UpdateFacilityBundleIdentifierResponse>;
  expectAcbsUpdateMethodToBeCalledOnceWith: (acbsUpdateMethodRequest: T) => void;
  getAcbsFacilityServiceGetFacilityByIdentifierMock: () => jest.Mock<any, any, any>;
  getAcbsUpdateMethodMock: () => jest.Mock<any, any, any>;
  getAcbsGetFacilityRequestCalledCorrectlyMock: () => WhenMockWithMatchers<any, any>;
  mockSuccessfulAcbsUpdateMethod: () => (WhenMockWithMatchers<any, any> & WhenMock<any, any>) | void;
}