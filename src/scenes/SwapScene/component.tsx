import { Big } from 'big.js';
import React, { useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import Web3 from 'web3';
import ABI from 'human-standard-token-abi';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import { isNativeToken } from '../../modules/para-inch';
import { useParaInch } from '../../modules/para-inch-react';
import { useOnboard } from '../../modules/onboard';
import { useSkybridgeSwap } from '../../modules/skybridge';
import { usePriceHistoryLazyQuery } from '../../generated/skypools-graphql';

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
  otherExchanges,
} from './styles';
import { Widget } from './Widget';
import { OtherExchanges } from './OtherExchanges';

const FAKE_QUOTE_ROUTE: React.ComponentPropsWithoutRef<typeof SwapPath>['value'] = {
  path: [[{ exchange: '…', fraction: '1' }]],
};

export const SwapScene = () => {
  const { network: onboardNetwork, wallet, address } = useOnboard();
  const { fromToken, toToken, network, setNetwork, setAmount, swapQuote } = useParaInch();
  const { swapId } = useSkybridgeSwap();
  const [getPriceHistory, { data: priceHistoryData }] = usePriceHistoryLazyQuery();

  const priceHistory = useMemo(
    () =>
      priceHistoryData?.priceHistoric.map(
        (it): React.ComponentPropsWithoutRef<typeof TradingView>['data'][number] => ({
          time: it.at,
          value: +it.price,
        }),
      ),
    [priceHistoryData?.priceHistoric],
  );

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

    if (!walletProvider || !fromToken || !address || !!swapId) {
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
  }, [wallet, setAmount, address, fromToken, swapId]);

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        {!!priceHistory && priceHistory.length > 0 && (
          <div css={chartContainer}>
            <TradingView data={priceHistory} />
          </div>
        )}

        <div css={swapPathContainer}>
          <SwapPath
            css={swapQuote === null && loadingPulseAnimation}
            value={swapQuote?.bestRoute ?? FAKE_QUOTE_ROUTE}
          />
        </div>

        <OtherExchanges css={otherExchanges} />
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
