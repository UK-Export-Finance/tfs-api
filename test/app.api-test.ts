import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MainModule } from '@ukef/main.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MainModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * This is an empty test case to satisfy GHA.
   * Once tests organically evolves, please remove
   * below.
   */
  it('An empty test case', () => {
    expect(true).toBe(true);
  });
});
