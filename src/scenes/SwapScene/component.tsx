import { Big } from 'big.js';
import React, { useEffect } from 'react';
import Head from 'next/head';

import { Layout } from '../../components/Layout';
import { SwapPath } from '../../components/SwapPath';
import { usePriceHistoryLazyQuery } from '../../generated/skypools-graphql';
import {
  buildSkypoolsContract,
  getERC20Address,
  getWrappedBtcAddress,
  isFakeBtcToken,
} from '../../modules/para-inch';
import { useParaInchForm } from '../../modules/para-inch-react';
import { useWalletConnection } from '../../modules/hooks/useWalletConnection';

import { OtherExchanges } from './OtherExchanges';
import { Slippage } from './Slippage';
import { otherExchanges, swapPathContainer } from './styles';
import { Widget } from './Widget';

const FAKE_QUOTE_ROUTE: React.ComponentPropsWithoutRef<typeof SwapPath>['value'] = {
  path: [
    {
      fraction: '1',
      swaps: [
        {
          srcTokenAddress: '0x',
          destTokenAddress: '0x',
          exchanges: [{ exchange: '…', fraction: '1' }],
        },
      ],
    },
  ],
};

export const SwapScene = () => {
  const { address, wallet, network: onboardNetwork } = useWalletConnection();
  const { fromToken, toToken, network, setNetwork, setAmount, swapQuote } = useParaInchForm();
  const [getPriceHistory, { data: priceHistoryData }] = usePriceHistoryLazyQuery();

  useEffect(() => {
    if (!onboardNetwork) return;
    setNetwork(onboardNetwork);
  }, [onboardNetwork, network, setNetwork]);

  useEffect(() => {
    const firstTokenId = fromToken?.id;
    const secondTokenId = toToken?.id;
    if (!firstTokenId || !secondTokenId) {
      return;
    }

    getPriceHistory({ variables: { firstTokenId, secondTokenId } });
  }, [fromToken, getPriceHistory, toToken]);

  useEffect(() => {
    const walletProvider = wallet?.provider;

    if (!walletProvider || !fromToken || !address) {
      return;
    }

    let cancelled = false;

    (async () => {
      const balance = await (async () => {
        const network = onboardNetwork ?? 'ETHEREUM';
        const token = isFakeBtcToken(fromToken.address)
          ? getWrappedBtcAddress(network)
          : getERC20Address({ network, tokenAddress: fromToken.address });
        const contract = buildSkypoolsContract(network);
        return new Big(await contract.methods.balanceOf(token, address).call())
          .div(`1e${fromToken.decimals}`)
          .toFixed();
      })();

      if (cancelled) return;
      setAmount(balance);
    })();

    return () => {
      cancelled = true;
    };
  }, [wallet, setAmount, address, fromToken, onboardNetwork]);

  return (
    <>
      <Head>
        <title>Swingby SkyPools | Swap</title>
      </Head>
      <Layout
        isSkybridgeWidget={false}
        afterPriceChart={
          <>
            {swapQuote ? (
              <div css={swapPathContainer}>
                <SwapPath value={swapQuote?.bestRoute ?? FAKE_QUOTE_ROUTE} />
              </div>
            ) : null}
            <OtherExchanges css={otherExchanges} />
          </>
        }
        priceHistory={priceHistoryData?.priceHistoric}
        widgetContent={
          <>
            <Widget />
            <Slippage />
          </>
        }
      />
    </>
  );
};
