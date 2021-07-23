import { Duration } from 'luxon';
import { Network } from '@prisma/client';

import { fetcher } from '../src/modules/fetch';
import { logger } from '../src/modules/logger';
import { server__processTaskSecret } from '../src/modules/server__env';

const REPEAT_INTERVAL = Duration.fromObject({ seconds: 30 }).as('milliseconds');
const TIMEOUT_AFTER = Duration.fromObject({ minutes: 1.5 }).as('milliseconds');

const NETWORKS = Object.values(Network).map((it) => it.toLowerCase() as Lowercase<Network>);
const NETWORK_TASKS = ['tokens', 'prices-historic'];

NETWORKS.forEach((mode) => {
  NETWORK_TASKS.forEach((task) => {
    (async () => {
      const generator = runNetworkTask(mode, task);
      for await (let value of generator) {
        logger.info(value, 'Got result for %j/%j', mode, task);
      }
    })();
  });
});

async function* runNetworkTask(
  network: typeof NETWORKS[number],
  task: typeof NETWORK_TASKS[number],
) {
  for (;;) {
    try {
      const controller = new AbortController();

      const id = setTimeout(() => controller.abort(), TIMEOUT_AFTER);
      const result = await fetcher<Record<string, any>>(
        `https://k8s.skybridge.exchange/skypools/api/process/${network}/${task}?secret=${server__processTaskSecret}`,
        { signal: controller.signal },
      );
      clearTimeout(id);

      yield { mode: network, task, result };
    } catch (e) {
      yield { mode: network, task, err: e as Error };
    }

    await new Promise((resolve) => setTimeout(resolve, REPEAT_INTERVAL));
  }
}
