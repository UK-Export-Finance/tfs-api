import './load-dotenv';

import { registerAs } from '@nestjs/config';

export default registerAs(
  'doc',
  (): Record<string, any> => ({
    name: process.env.DOC_NAME || 'TFS API Specification',
    description: 'TFS API documentation',
    version: process.env.DOC_VERSION || '1.0',
    prefix: '/docs',
  }),
);
