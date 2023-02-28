import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App as AppUnderTest } from '@ukef/app';
import { MainModule } from '@ukef/main.module';

export class App extends AppUnderTest {
  static async create(): Promise<App> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MainModule],
    }).compile();

    const nestApp = moduleFixture.createNestApplication();
    await nestApp.init();

    return new App(nestApp);
  }

  getHttpServer(): any {
    return this.app.getHttpServer();
  }

  destroy(): Promise<void> {
    return this.app.close();
  }
}
