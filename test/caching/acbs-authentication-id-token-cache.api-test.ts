import { givenAuthenticationWithTheIdpSucceedsWith } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { waitForAcbsAuthenticationIdTokenCacheToExpire } from '@ukef-test/support/wait-for';
import nock from 'nock';

describe('ACBS Authentication ID Token Cache', () => {
  const valueGenerator = new RandomValueGenerator();
  const firstSessionId = valueGenerator.string();
  const firstIdToken = valueGenerator.string();
  const secondSessionId = valueGenerator.string();
  const secondIdToken = valueGenerator.string();
  const partyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });

  let api: Api;

  beforeEach(async () => {
    api = await Api.create();
  });

  afterEach(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  beforeEach(() => {
    givenAuthenticationWithTheIdpSucceedsWith({ sessionId: firstSessionId, idToken: firstIdToken });
    givenAuthenticationWithTheIdpSucceedsWith({ sessionId: secondSessionId, idToken: secondIdToken });
  });

  it('uses the same id token for all requests made within the id token TTL', async () => {
    const firstExpectedAcbsRequest = acbsGetPartyRequestWith({ idToken: firstIdToken });
    const secondExpectedAcbsRequest = acbsGetPartyRequestWith({ idToken: firstIdToken });

    await getPartyFromApi();
    await getPartyFromApi();

    expect(firstExpectedAcbsRequest.isDone()).toBe(true);
    expect(secondExpectedAcbsRequest.isDone()).toBe(true);
  });

  it('uses a different id token for two requests made outside the id token TTL', async () => {
    const firstExpectedAcbsRequest = acbsGetPartyRequestWith({ idToken: firstIdToken });
    const secondExpectedAcbsRequest = acbsGetPartyRequestWith({ idToken: secondIdToken });

    await getPartyFromApi();
    await waitForAcbsAuthenticationIdTokenCacheToExpire();
    await getPartyFromApi();

    expect(firstExpectedAcbsRequest.isDone()).toBe(true);
    expect(secondExpectedAcbsRequest.isDone()).toBe(true);
  });

  const acbsGetPartyRequestWith = ({ idToken }: { idToken: string }): nock.Scope =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/${partyIdentifier}`).matchHeader('authorization', `Bearer ${idToken}`).reply(400);

  const getPartyFromApi = async (): Promise<void> => {
    await api.get(`/api/v1/parties/${partyIdentifier}`);
  };
});
