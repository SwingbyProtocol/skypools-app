import { logger as baseLogger } from '../../../logger';
import { getSwapDetails } from '../index';

// Config: shouldUseParaSwap === true
it('Test for getting tx detail with currencyOut: nativeToken', async () => {
  const tx = await getSwapDetails({
    hash: '0xa3a1061d5fcb68ea2304d42968ae9086ca47020740154d3155991a8e8bb0f414',
    network: 'ETHEREUM',
    logger: baseLogger,
  });

  expect(Number(tx?.srcAmount)).toStrictEqual(0.03);
  expect(Number(tx?.destAmount)).toStrictEqual(97.2471);
});

it('Test for getting tx detail with currencyIn: nativeToken', async () => {
  const tx = await getSwapDetails({
    hash: '0xeafc9baceff6873382d724568ccfc040db72ddf0ffce2297c5a02a543e0456b3',
    network: 'ETHEREUM',
    logger: baseLogger,
  });
  expect(Number(tx?.srcAmount)).toStrictEqual(100);
  expect(Number(tx?.destAmount)).toStrictEqual(0.044896115385884086);
});
