import nock from 'nock/types';

export interface PutFacilityAcbsRequests {
  acbsGetRequest: nock.Scope;
  acbsUpdateRequest: nock.Scope;
}
