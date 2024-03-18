import 'dotenv/config';

import { SSTConfig } from 'sst';

import { API } from './stacks/Default';

export default {
  config(_input) {
    return {
      name: 'sst-turso-drizzle-bug',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs20.x',
    });
    app.stack(API);
  },
} satisfies SSTConfig;
