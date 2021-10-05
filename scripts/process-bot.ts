import { Duration } from 'luxon';
import { stringifyUrl } from 'query-string';

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
  { name: 'swap-logs', repeatInterval: Duration.fromObject({ seconds: 15 }).as('milliseconds') },
  { name: 'swap-status', repeatInterval: Duration.fromObject({ seconds: 15 }).as('milliseconds') },
  'token-logos',
  'tokens',
];

NETWORKS.forEach((mode) => {
  NETWORK_TASKS.forEach((task) => {
    (async () => {
      const generator = runNetworkTask(mode, task);
      for await (let value of generator) {
        logger.info(value, 'Got result for task: %j/%j', mode, task);
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
    logger.debug({ server__processTaskSecret }, 'Will run task: %j/%j', network, task);

    try {
      const controller = new AbortController();

      const url = stringifyUrl({
        url: `http://skypools-ed-deployment:3000/api/process/${network}/${config.name}`,
        query: { secret: server__processTaskSecret },
      });
      logger.debug('Will call URL "%s"', url);

      const id = setTimeout(() => controller.abort(), TIMEOUT_AFTER);
      const result = await fetcher<Record<string, any>>(url, { signal: controller.signal });
      clearTimeout(id);

      yield { mode: network, task, result };
    } catch (e) {
      yield { mode: network, task, err: e as Error };
    }

    await new Promise((resolve) => setTimeout(resolve, config.repeatInterval));
  }
}
