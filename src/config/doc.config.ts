import './load-dotenv';

import { registerAs } from '@nestjs/config';

export const DocConfig = registerAs('doc', (): Record<string, any> => ({
  name: process.env.DOC_NAME || 'TFS API Specification',
  description: 'TFS API documentation',
  version: process.env.DOC_VERSION || '1.0',
  prefix: '/docs',
}));
