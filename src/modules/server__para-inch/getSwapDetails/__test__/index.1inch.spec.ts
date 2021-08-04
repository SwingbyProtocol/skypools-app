import { Network } from '../../../networks';
import { logger as baseLogger } from '../../../logger';
import { getSwapDetails, isSwapTx } from '../index';

type Params = {
  network: Network;
  hash: string;
  logger: typeof baseLogger;
};

// Config: shouldUseParaSwap === false

it('Test for Unoswap function', async () => {
  const arg: Params = {
    hash: '0x5d72c461ce63d89e0e87a2928c4710c3758f27b544d3e3e49fa8f2c058411d2b',
    network: 'ETHEREUM',
    logger: baseLogger,
  };
  const tx = await getSwapDetails(arg);
  expect(Number(tx?.srcAmount)).toStrictEqual(86.6984);
  expect(Number(tx?.destAmount)).toStrictEqual(0.809383917868739369);
  expect(await isSwapTx(arg)).toStrictEqual(true);
});

it('Test for swap event', async () => {
  const arg: Params = {
    hash: '0xa58131dc731c123f4a8a7e21fca0904c8a2ffd5385cc8ba808e565ce8fffa72b',
    network: 'BSC',
    logger: baseLogger,
  };
  const tx = await getSwapDetails(arg);
  expect(Number(tx?.srcAmount)).toStrictEqual(1);
  expect(Number(tx?.destAmount)).toStrictEqual(0.999859991272525763);
  expect(await isSwapTx(arg)).toStrictEqual(true);
});
