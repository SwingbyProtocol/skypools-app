import type { Config } from 'apollo-server-micro';

import { graphqlEndpoint, selfUrl } from '../env';

export const playground: Config['playground'] = {
  endpoint: `${selfUrl}${graphqlEndpoint}`,
  tabs: undefined,
};
