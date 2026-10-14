import nock from 'nock';

export type PutFacilityAcbsRequests = {
  acbsGetRequest: nock.Scope;
  acbsUpdateRequest: nock.Scope;
};
