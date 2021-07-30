import { Fragment } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Big } from 'big.js';

import { useParaInch } from '../../../modules/para-inch-react';
import { PlatformLogo } from '../../../components/PlatformLogo';

import {
  amount,
  comparison,
  comparisonBetter,
  comparisonMatch,
  comparisonWorse,
  container,
  exchange,
  exchangeLogo,
  exchangeName,
} from './styles';

export const OtherExchanges = ({ className }: { className?: string }) => {
  const { swapQuote, isAmountValid } = useParaInch();

  if (!swapQuote || swapQuote.otherExchanges.length < 1) {
    return <></>;
  }

  return (
    <div css={container} className={className}>
      {swapQuote.otherExchanges.map((it, index) => {
        const isMatch = new Big(it.fractionOfBest).eq(1);
        const isWorse = new Big(it.fractionOfBest).lt(1);
        const isBetter = new Big(it.fractionOfBest).gt(1);
        return (
          <Fragment key={index}>
            <div css={exchange}>
              <PlatformLogo css={exchangeLogo} name={it.exchange} />
              <span css={exchangeName}>{it.exchange}</span>
            </div>

            <div css={amount}>
              {isAmountValid && (
                <FormattedNumber
                  value={+it.destTokenAmountUsd}
                  style="currency" // eslint-disable-line react/style-prop-object
                  currency="USD"
                />
              )}
            </div>

            <div
              css={[
                comparison,
                isMatch && comparisonMatch,
                isWorse && comparisonWorse,
                isBetter && comparisonBetter,
              ]}
            >
              {isMatch ? (
                <FormattedMessage id="comparison.match" />
              ) : (
                <FormattedNumber
                  value={new Big(-1).add(it.fractionOfBest).toNumber()}
                  style="percent" // eslint-disable-line react/style-prop-object
                  maximumFractionDigits={2}
                  signDisplay="always"
                />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};
