import { Big } from 'big.js';
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import Web3 from 'web3';
import ABI from 'human-standard-token-abi';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import {
  getPriceHistory,
  isNativeToken,
  isSupportedNetworkId,
  SwapQuoteRoute,
} from '../../modules/para-inch';
import { useParaInch } from '../../modules/para-inch-react';
import { useOnboard } from '../../modules/onboard';
import { logger } from '../../modules/logger';

import { History } from './History';
import {
  chartContainer,
  headerContainer,
  historyCard,
  priceAndPathCard,
  swapPathContainer,
  swapScene,
  widgetCard,
  loadingPulseAnimation,
  historyContainer,
} from './styles';
import { Widget } from './Widget';

const FAKE_PRICE_HISTORY = new Array(150)
  .fill(null)
  .map((_, index) => ({
    time: DateTime.utc().minus({ months: index }).toISO(),
    value: 1,
  }))
  .reverse();

const FAKE_QUOTE_ROUTE: SwapQuoteRoute = {
  path: [
    [{ exchange: '…', fraction: new Big(1), fromTokenAddress: '0xaa', toTokenAddress: '0xaa' }],
  ],
  estimatedGas: new Big(0),
  estimatedGasUsd: new Big(0),
  toTokenAmount: new Big(0),
  toTokenAmountUsd: new Big(0),
  transaction: null,
  spender: null,
};

export const SwapScene = () => {
  const { network: onboardNetwork, wallet, address } = useOnboard();
  const { fromToken, toToken, network, setNetwork, setAmount, swapQuote } = useParaInch();
  const [priceHistory, setPriceHistory] = useState<
    React.ComponentPropsWithoutRef<typeof TradingView>['data'] | null
  >(null);

  useEffect(() => {
    if (!onboardNetwork || network === onboardNetwork || !isSupportedNetworkId(onboardNetwork))
      return;
    setNetwork(onboardNetwork);
  }, [onboardNetwork, network, setNetwork]);

  useEffect(() => {
    let cancelled = false;

    const fromTokenAddress = fromToken?.address;
    const toTokenAddress = toToken?.address;
    if (!fromTokenAddress || !toTokenAddress) {
      return;
    }

    const loadPriceHistory = async () => {
      try {
        if (cancelled) return;

        setPriceHistory(null);
        const result = await getPriceHistory({
          fromTokenAddress,
          toTokenAddress,
          network,
        });

        if (cancelled) return;
        setPriceHistory(result.map((it) => ({ time: it.at.toISO(), value: it.value.toNumber() })));
      } catch (err) {
        logger.error({ err }, 'Failed to load price history');
        setTimeout(loadPriceHistory, 2500);
      }
    };

    loadPriceHistory();

    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, network]);

  useEffect(() => {
    const walletProvider = wallet?.provider;

    if (!walletProvider || !fromToken || !address) {
      return;
    }

    let cancelled = false;

    (async () => {
      const web3 = new Web3(walletProvider);
      const balance = await (async () => {
        if (isNativeToken(fromToken.address)) {
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

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        <div css={[chartContainer, priceHistory === null && loadingPulseAnimation]}>
          <TradingView data={priceHistory ?? FAKE_PRICE_HISTORY} />
        </div>

        <div css={swapPathContainer}>
          <SwapPath
            css={swapQuote === null && loadingPulseAnimation}
            value={swapQuote?.bestRoute ?? FAKE_QUOTE_ROUTE}
          />
        </div>

        {!!swapQuote && swapQuote.otherRoutes.length > 1 && <></>}
      </Card>

      <Card css={widgetCard}>
        <Widget />
      </Card>

      <div css={historyContainer}>
        <History css={historyCard} />
      </div>
    </div>
  );
};
