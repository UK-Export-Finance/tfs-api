import { AUTH } from '@ukef/constants';
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
    return this.request().get(url).set(this.getValidAuthHeader());
  }

  getWithoutAuth(url: string, strategy?: string, key?: string): request.Test {
    const query = this.request().get(url);
    if (strategy) {
      return query.set({ [strategy]: key });
    }
    return query;
  }

  getDocsWithBasicAuth(url: string, { username, password }: { username: string; password: string }): request.Test {
    return this.request().get(url).auth(username, password);
  }

  post(url: string, body: string | object): request.Test {
    return this.request().post(url).send(body).set(this.getValidAuthHeader());
  }

  postWithoutAuth(url: string, body: string | object, strategy?: string, key?: string): request.Test {
    const query = this.request().post(url).send(body);
    if (strategy) {
      return query.set({ [strategy]: key });
    }
    return query;
  }

  destroy(): Promise<void> {
    return this.app.destroy();
  }

  private request(): request.SuperTest<request.Test> {
    return request(this.app.getHttpServer());
  }

  private getValidAuthHeader(): Record<string, string> {
    const apiKey = ENVIRONMENT_VARIABLES.API_KEY;
    const strategy = AUTH.STRATEGY;
    return { [strategy]: apiKey };
  }
}
