import './load-dotenv';

import { registerAs } from '@nestjs/config';

export default registerAs(
  'app',
  (): Record<string, any> => ({
    name: process.env.APP_NAME || 'tfs',
    env: process.env.NODE_ENV || 'development',

    versioning: {
      enable: process.env.HTTP_VERSIONING_ENABLE === 'true' || false,
      prefix: 'v',
      version: process.env.HTTP_VERSION || '1',
    },

    globalPrefix: '/api',
    port: process.env.HTTP_PORT ? Number.parseInt(process.env.HTTP_PORT, 10) : 3001,
    apiKey: process.env.API_KEY,
  }),
);
