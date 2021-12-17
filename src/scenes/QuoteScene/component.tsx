import { Big } from 'big.js';
import React, { useEffect } from 'react';
import Web3 from 'web3';
import ABI from 'human-standard-token-abi';

import { SwapPath } from '../../components/SwapPath';
import { isFakeNativeToken } from '../../modules/para-inch';
import { useParaInchForm } from '../../modules/para-inch-react';
import { useOnboard } from '../../modules/onboard';
import { usePriceHistoryLazyQuery } from '../../generated/skypools-graphql';
import { Layout } from '../../components/Layout';
import { pulseAnimationBlackAndWhite } from '../../modules/styles';

import { swapPathContainer, otherExchanges } from './styles';
import { Widget } from './Widget';
import { OtherExchanges } from './OtherExchanges';
import { Slippage } from './Slippage';

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

export const QuoteScene = () => {
  const { network: onboardNetwork, wallet, address } = useOnboard();
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
      const web3 = new Web3(walletProvider);
      const balance = await (async () => {
        if (isFakeNativeToken(fromToken.address)) {
          return web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
        }

        const contract = new web3.eth.Contract(ABI, fromToken.address);
        return new Big(await contract.methods.balanceOf(address).call())
          .div(`1e${fromToken.decimals}`)
          .toFixed();
      })();

      if (cancelled) return;
      setAmount(balance);
    })();

    return () => {
      cancelled = true;
    };
  }, [wallet, setAmount, address, fromToken]);

  const isFromBtc = fromToken?.symbol === 'BTC';
  const isToBtc = toToken?.symbol === 'BTC';
  const isParaSwap = !isToBtc && !isFromBtc;

  return (
    <Layout
      isSkybridgeWidget={false}
      afterPriceChart={
        <>
          <div css={swapPathContainer}>
            <SwapPath
              css={swapQuote === null && pulseAnimationBlackAndWhite}
              value={swapQuote?.bestRoute ?? FAKE_QUOTE_ROUTE}
            />
          </div>

          <OtherExchanges css={otherExchanges} />
        </>
      }
      priceHistory={priceHistoryData?.priceHistoric}
      widgetContent={
        <>
          <Widget />
          {isParaSwap && <Slippage />}
        </>
      }
    />
  );
};
