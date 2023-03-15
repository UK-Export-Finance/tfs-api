import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';

describe('GET /docs-yaml', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  it('returns a 200 OK response', async () => {
    const { status } = await api.getWithBasicAuth('/docs-yaml', {
      username: ENVIRONMENT_VARIABLES.SWAGGER_USER,
      password: ENVIRONMENT_VARIABLES.SWAGGER_PASSWORD,
    });
    expect(status).toBe(200);
  });

  it('matches the snapshot', async () => {
    const { text } = await api.getWithBasicAuth('/docs-yaml', {
      username: ENVIRONMENT_VARIABLES.SWAGGER_USER,
      password: ENVIRONMENT_VARIABLES.SWAGGER_PASSWORD,
    });
    expect(text).toMatchSnapshot();
  });
});
