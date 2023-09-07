import { Test, TestingModule } from '@nestjs/testing';
import { App as AppUnderTest } from '@ukef/app';
import { MainModule } from '@ukef/main.module';

export class App extends AppUnderTest {
  // class ModifiedMainModule extends MainModule {

  // }

  static async create(): Promise<App> {
    console.log('======================================= >>>>>>>>>>>>>>>>>>');
    console.log('======================================= MainModule', MainModule);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      //imports: [ModifiedMainModule],
      imports: [MainModule],
    })
    .overrideModule(LoggerModule)
    .useModule(LoggerTestingModule)
    .compile();

    const nestApp = moduleFixture.createNestApplication();

    const app = new App(nestApp);

    await nestApp.init();

    return app;
  }

  getHttpServer(): any {
    return this.app.getHttpServer();
  }

  destroy(): Promise<void> {
    return this.app.close();
  }
}
