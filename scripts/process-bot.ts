import { Duration } from 'luxon';

import { Network } from '../src/modules/networks';
import { fetcher } from '../src/modules/fetch';
import { logger } from '../src/modules/logger';

const REPEAT_INTERVAL = Duration.fromObject({ seconds: 30 }).as('milliseconds');
const TIMEOUT_AFTER = Duration.fromObject({ minutes: 1.5 }).as('milliseconds');

type TaskConfig = { name: string; repeatInterval?: number };
type Task = string | TaskConfig;

const isTaskConfig = (value: any): value is TaskConfig =>
  typeof value === 'object' && typeof value.name === 'string';

const NETWORKS = Object.values(Network).map((it) => it.toLowerCase() as Lowercase<Network>);
const NETWORK_TASKS: Task[] = ['prices-historic', 'token-logos', 'tokens'];

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
    logger.debug('Will run task: %j/%j', network, task);

    try {
      const controller = new AbortController();

      const url = `${process.env.BASE_URL}/api/process/${network}/${config.name}`;
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
