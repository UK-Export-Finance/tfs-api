import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import request from 'supertest';

import { App } from './app';

export class Api {
  static async create(): Promise<Api> {
    const app = await App.create();
    return new Api(app);
  }

  constructor(private readonly app: App) {}

  get(url: string): request.Test {
    const apiKey = ENVIRONMENT_VARIABLES.API_KEY;
    const strategy = ENVIRONMENT_VARIABLES.API_KEY_STRATEGY;
    return request(this.app.getHttpServer())
      .get(url)
      .set({ [strategy]: apiKey });
  }

  getWithoutAuth(url: string): request.Test {
    return request(this.app.getHttpServer()).get(url);
  }

  getDocsWithBasicAuth(url: string, { username, password }: { username: string; password: string }): request.Test {
    return request(this.app.getHttpServer()).get(url).auth(username, password);
  }

  destroy(): Promise<void> {
    return this.app.destroy();
  }
}
