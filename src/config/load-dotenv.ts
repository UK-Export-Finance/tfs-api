import * as dotenv from 'dotenv';

function loadEnvironmentFile(): void {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
    return;
  }

  dotenv.config();
}

loadEnvironmentFile();
