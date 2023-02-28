import request from 'supertest';

import { App } from './app';

export class Api {
  static async create(): Promise<Api> {
    const app = await App.create();
    return new Api(app);
  }

  constructor(private readonly app: App) {}

  get(url: string): request.Test {
    return request(this.app.getHttpServer()).get(url);
  }

  destroy(): Promise<void> {
    return this.app.destroy();
  }
}
