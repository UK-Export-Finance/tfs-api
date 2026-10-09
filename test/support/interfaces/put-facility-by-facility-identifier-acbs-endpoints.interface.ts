import nock from 'nock/types';

export type PutFacilityAcbsRequests = {
  acbsGetRequest: nock.Scope;
  acbsUpdateRequest: nock.Scope;
};
