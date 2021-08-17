import { Duration } from 'luxon';

import { Network } from '../src/modules/networks';
import { fetcher } from '../src/modules/fetch';
import { logger } from '../src/modules/logger';
import { server__processTaskSecret } from '../src/modules/server__env';

const REPEAT_INTERVAL = Duration.fromObject({ seconds: 30 }).as('milliseconds');
const TIMEOUT_AFTER = Duration.fromObject({ minutes: 1.5 }).as('milliseconds');

type TaskConfig = { name: string; repeatInterval?: number };
type Task = string | TaskConfig;

const isTaskConfig = (value: any): value is TaskConfig =>
  typeof value === 'object' && typeof value.name === 'string';

const NETWORKS = Object.values(Network).map((it) => it.toLowerCase() as Lowercase<Network>);
const NETWORK_TASKS: Task[] = [
  'newer-swaps',
  'older-swaps',
  'prices-historic',
  { name: 'swap-details', repeatInterval: Duration.fromObject({ seconds: 15 }).as('milliseconds') },
  'swap-logs',
  { name: 'swap-status', repeatInterval: Duration.fromObject({ seconds: 15 }).as('milliseconds') },
  'token-logos',
  { name: 'tokens', repeatInterval: Duration.fromObject({ hours: 2 }).as('milliseconds') },
];

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
    const config: TaskConfig = {
      repeatInterval: REPEAT_INTERVAL,
      ...(isTaskConfig(task) ? task : { name: task }),
    };

    try {
      const controller = new AbortController();

      const id = setTimeout(() => controller.abort(), TIMEOUT_AFTER);
      const result = await fetcher<Record<string, any>>(
        `https://k8s.skybridge.exchange/skypools/api/process/${network}/${config.name}?secret=${server__processTaskSecret}`,
        { signal: controller.signal },
      );
      clearTimeout(id);

      yield { mode: network, task, result };
    } catch (e) {
      yield { mode: network, task, err: e as Error };
    }

    await new Promise((resolve) => setTimeout(resolve, config.repeatInterval));
  }
}
