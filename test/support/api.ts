import request from 'supertest';

import { App } from './app';

export class Api {
  static async create(): Promise<Api> {
    const app = await App.create();
    return new Api(app);
  }

  constructor(private readonly app: App) {}

  get(url: string): request.Test {
    const apiKey = process.env.API_KEY;
    const strategy = process.env.API_KEY_STRATEGY;
    return request(this.app.getHttpServer())
      .get(url)
      .set({ [strategy]: apiKey });
  }

  getWithBasicAuth(url: string, { username, password }: { username: string; password: string }): request.Test {
    return request(this.app.getHttpServer()).get(url).auth(username, password);
  }

  destroy(): Promise<void> {
    return this.app.destroy();
  }
}
