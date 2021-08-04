import { Network } from '../../../networks';
import { logger as baseLogger } from '../../../logger';
import { getSwapDetails, isSwapTx } from '../index';

type Params = {
  network: Network;
  hash: string;
  logger: typeof baseLogger;
};

// Config: shouldUseParaSwap === true

it('Test for getting tx detail with currencyOut: nativeToken', async () => {
  const arg: Params = {
    hash: '0xa3a1061d5fcb68ea2304d42968ae9086ca47020740154d3155991a8e8bb0f414',
    network: 'ETHEREUM',
    logger: baseLogger,
  };
  const tx = await getSwapDetails(arg);
  expect(Number(tx?.srcAmount)).toStrictEqual(0.03);
  expect(Number(tx?.destAmount)).toStrictEqual(97.2471);
  expect(await isSwapTx(arg)).toStrictEqual(true);
});

it('Test for getting tx detail with currencyIn: nativeToken', async () => {
  const arg: Params = {
    hash: '0xeafc9baceff6873382d724568ccfc040db72ddf0ffce2297c5a02a543e0456b3',
    network: 'ETHEREUM',
    logger: baseLogger,
  };
  const tx = await getSwapDetails(arg);
  expect(Number(tx?.srcAmount)).toStrictEqual(100);
  expect(Number(tx?.destAmount)).toStrictEqual(0.044896115385884086);
  expect(await isSwapTx(arg)).toStrictEqual(true);
});
