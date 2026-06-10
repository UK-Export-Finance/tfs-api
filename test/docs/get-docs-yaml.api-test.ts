import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { Api } from '@ukef-test/support/api';

const { versioning: acbsVersioning, giftVersioning } = AppConfig();

describe('GET /openapi/yaml', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  it('should return a 200 OK response', async () => {
    const { status } = await api.get('/openapi/yaml');

    expect(status).toBe(HttpStatus.OK);
  });

  it('should contain some auto genearted YML documentation', async () => {
    const { text } = await api.get('/openapi/yaml');

    expect(text.includes('openapi')).toBeTruthy();

    expect(text.includes('paths')).toBeTruthy();

    expect(text.length).toBeGreaterThan(10000);

    expect(text.includes(`/api/${acbsVersioning.prefixAndVersion}`)).toBeTruthy();

    expect(text.includes(`/api/${giftVersioning.prefixAndVersion}`)).toBeTruthy();
  });
});
