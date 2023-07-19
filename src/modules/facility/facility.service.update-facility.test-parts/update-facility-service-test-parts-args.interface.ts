import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { WhenMock, WhenMockWithMatchers } from 'jest-when';

export interface UpdateFacilityServiceTestPartsArgs<T> {
  valueGenerator: RandomValueGenerator;
  updateFacilityRequest: UpdateFacilityRequest;
  acbsGetExistingFacilityResponse: AcbsGetFacilityResponseDto;
  expectedAcbsUpdateMethodRequest: T;
  expectedResult: undefined | AcbsCreateBundleInformationResponseHeadersDto;
  updateFacility: (updateFacilityRequest: UpdateFacilityRequest) => Promise<void> | Promise<AcbsCreateBundleInformationResponseHeadersDto>;
  expectAcbsUpdateMethodToBeCalledOnceWith: (acbsUpdateMethodRequest: T) => void;
  getAcbsFacilityServiceGetFacilityByIdentifierMock: () => jest.Mock<any, any, any>;
  getAcbsUpdateMethodMock: () => jest.Mock<any, any, any>;
  getAcbsGetFacilityRequestCalledCorrectlyMock: () => WhenMockWithMatchers<any, any>;
  mockSuccessfulAcbsUpdateMethod: () => (WhenMockWithMatchers<any, any> & WhenMock<any, any>) | void;
}
