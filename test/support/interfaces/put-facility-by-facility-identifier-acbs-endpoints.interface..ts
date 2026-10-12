import nock from 'nock';

export interface PutFacilityAcbsRequests {
  acbsGetRequest: nock.Scope;
  acbsUpdateRequest: nock.Scope;
}
